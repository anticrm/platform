//
// Copyright © 2020 Anticrm Platform Contributors.
//
// Licensed under the Eclipse Public License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License. You may
// obtain a copy of the License at https://www.eclipse.org/legal/epl-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//
// See the License for the specific language governing permissions and
// limitations under the License.
//

import {
  AnyLayout, ArrayOf, Class, CORE_CLASS_ARRAY_OF, CORE_CLASS_INSTANCE_OF, CORE_CLASS_STRING, Doc, DomainIndex, Emb,
  InstanceOf, Model, Obj, Ref, Storage, Tx, TxContext
} from '@anticrm/core'
import {
  CORE_CLASS_CREATE_TX, CORE_CLASS_DELETE_TX, CORE_CLASS_REFERENCE, CORE_CLASS_UPDATE_TX, CreateTx, DeleteTx, Reference,
  UpdateTx
} from '..'

import { deepEqual } from 'fast-equals'

import {
  MessageMarkType, parseMessage, ReferenceMark, traverseMarks, traverseMessage
} from '@anticrm/text'

interface ClassKey { key: string, _class: Ref<Class<Emb>> }

/**
 * I N D E X
 *
 * Parses object's and find backlinks in string values with reference format [Name](ref://class#id)
 *
 * Example:
 * Hello [Zaz](ref://chunter.Page#600eb7121900e6e361085f20)
 */
export class ReferenceIndex implements DomainIndex {
  private readonly modelDb: Model
  private readonly storage: Storage
  private readonly textAttributes = new Map<Ref<Class<Obj>>, string[]>()
  private readonly arrayAttributes = new Map<Ref<Class<Obj>>, ClassKey[]>()

  constructor (modelDb: Model, storage: Storage) {
    this.modelDb = modelDb
    this.storage = storage
  }

  private getTextAttributes (_class: Ref<Class<Obj>>): string[] {
    const cached = this.textAttributes.get(_class)
    if (cached !== undefined) return cached

    const keys = this.modelDb
      .getAllAttributes(_class)
      .filter((m) => m.attr.type._class === CORE_CLASS_STRING)
      .map((m) => m.key)
    this.textAttributes.set(_class, keys)
    return keys
  }

  private getArrayAttributes (_class: Ref<Class<Obj>>): ClassKey[] {
    const cached = this.arrayAttributes.get(_class)
    if (cached !== undefined) return cached

    const keys = this.modelDb
      .getAllAttributes(_class)
      .filter((m) => m.attr.type._class === CORE_CLASS_ARRAY_OF && (m.attr.type as ArrayOf).of._class === CORE_CLASS_INSTANCE_OF)
      .map((m) => {
        return {
          key: m.key,
          _class: ((m.attr.type as ArrayOf).of as InstanceOf<Emb>).of
        }
      })
    this.arrayAttributes.set(_class, keys)
    return keys
  }

  private referencesFromMessage (_class: Ref<Class<Doc>>, _id: Ref<Doc>, message: string, props: Record<string, unknown>, index: { value: number }): Reference[] {
    const result: Reference[] = []
    const refMatcher = new Set()
    traverseMessage(parseMessage(message), (el) => {
      traverseMarks(el, (m) => {
        if (m.type === MessageMarkType.reference) {
          const rm = m as ReferenceMark
          const key = rm.attrs.id + rm.attrs.class
          if (!refMatcher.has(key)) {
            refMatcher.add(key)
            index.value++
            result.push({
              _class: CORE_CLASS_REFERENCE,
              _id: `${_id}${index.value}` as Ref<Doc>, // Generate a sequence id based on source object id.
              _targetId: rm.attrs.id as Ref<Doc>,
              _targetClass: rm.attrs.class as Ref<Class<Doc>>,
              _sourceId: _id,
              _sourceClass: _class,
              _sourceProps: props
            })
          }
        }
      })
    })
    return result
  }

  private references (_class: Ref<Class<Doc>>, _id: Ref<Doc>, obj: AnyLayout, props: Record<string, unknown>, index: { value: number }): Reference[] {
    const attributes = this.getTextAttributes(_class)
    const backlinks = []
    for (const attr of attributes) {
      backlinks.push(...this.referencesFromMessage(_class, _id, (obj as any)[attr], props, index))
    }
    return backlinks
  }

  async tx (ctx: TxContext, tx: Tx): Promise<any> {
    switch (tx._class) {
      case CORE_CLASS_CREATE_TX:
        return await this.onCreate(ctx, tx as CreateTx)
      case CORE_CLASS_UPDATE_TX:
        return await this.onUpdateTx(ctx, tx as UpdateTx)
      case CORE_CLASS_DELETE_TX:
        return await this.onDeleteTx(ctx, tx as DeleteTx)
      default:
        console.log('not implemented text tx', tx)
    }
  }

  private collect (_objectClass: Ref<Class<Doc>>, _objectId: Ref<Doc>, object: any): Reference[] {
    const index = { value: 0 }
    const backlinks = this.references(_objectClass, _objectId, object, { pos: -1 }, index)
    const arrays = this.getArrayAttributes(_objectClass)
    for (const attr of arrays) {
      const arr = object[attr.key]
      if (arr !== undefined) {
        for (let i = 0; i < arr.length; i++) {
          backlinks.push(...this.references(_objectClass, _objectId, arr[i], {
            pos: i,
            key: attr.key,
            attrClass: attr._class
          }, index))
        }
      }
    }
    return backlinks
  }

  private async onCreate (ctx: TxContext, create: CreateTx): Promise<any> {
    const refereces = this.collect(create._objectClass, create._objectId, create.object)
    if (refereces.length === 0) {
      return
    }
    return await Promise.all(refereces.map(async (d) => {
      await this.storage.store(ctx, d)
    }))
  }

  private async onUpdateTx (ctx: TxContext, update: UpdateTx): Promise<any> {
    const obj = await this.storage.findOne(update._objectClass, { _id: update._objectId }) as Doc
    this.modelDb.updateDocument(this.modelDb.as(obj, update._objectClass), update.operations)
    if (obj === undefined) {
      throw new Error('object not found')
    }

    // Find current refs for this object
    const refs = await this.storage.find(CORE_CLASS_REFERENCE, {
      _sourceId: update._objectId,
      _sourceClass: update._objectClass
    })

    return await this.diffApply(refs, this.collect(update._objectClass, update._objectId, obj as any), ctx)
  }

  private async diffApply (refs: Reference[], newRefs: Reference[], ctx: TxContext): Promise<void> {
    // Do diff from old refs to remove only missing.
    const deletes: Reference[] = []
    const existing: Reference[] = []

    for (const ref of refs) {
      const refData: any = Object.assign({}, ref)
      delete refData._id

      for (const newRef of newRefs) {
        const newRefData: any = Object.assign({}, newRef)
        delete newRefData._id
        if (!deepEqual(refData, newRefData)) {
          // We had existing link, no op required for it.
          existing.push(newRef)
          break
        }
        // Not found, so let's remove it.
        deletes.push(ref)
      }
    }
    const additions = newRefs.filter(e => !existing.includes(e))
    const stored = Promise.all(additions.map(async (d) => {
      await this.storage.store(ctx, d)
    }))
    const deleted = Promise.all(deletes.map(async (d) => {
      await this.storage.remove(ctx, d._class, d._id)
    }))
    await Promise.all([stored, deleted])
  }

  private async onDeleteTx (ctx: TxContext, deleteTx: DeleteTx): Promise<any> {
    // Find current refs for this object to clean all of them.
    const refs = await this.storage.find(CORE_CLASS_REFERENCE, {
      _sourceId: deleteTx._objectId,
      _sourceClass: deleteTx._objectClass
    })

    return await this.diffApply(refs, [], ctx)
  }
}
