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
  Ref,
  Class,
  Doc,
  Obj,
  ArrayOf,
  InstanceOf,
  Emb,
  AnyLayout,
  CORE_CLASS_STRING,
  CORE_CLASS_ARRAY_OF, CORE_CLASS_INSTANCE_OF,
  DomainIndex, Storage, Tx, TxContext, generateId,
  Model
} from '@anticrm/core'
import { Backlink, Backlinks, CORE_CLASS_BACKLINKS, CreateTx, CORE_CLASS_CREATE_TX } from '..'

import {
  MessageMarkType,
  MessageNode,
  parseMessage,
  ReferenceMark,
  traverseMarks,
  traverseMessage
} from '@anticrm/text'

type ClassKey = { key: string, _class: Ref<Class<Emb>> }

/**
 * I N D E X
 *
 * Parses object's and find backlinks in string values with reference format [Name](ref://class#id)
 *
 * Example:
 * Hello [Zaz](ref://chunter.Page#600eb7121900e6e361085f20)
 */
export class BacklinkIndex implements DomainIndex {
  private modelDb: Model
  private storage: Storage
  private textAttributes = new Map<Ref<Class<Obj>>, string[]>()
  private arrayAttributes = new Map<Ref<Class<Obj>>, ClassKey[]>()

  constructor (modelDb: Model, storage: Storage) {
    this.modelDb = modelDb
    this.storage = storage
  }

  private getTextAttributes (_class: Ref<Class<Obj>>): string[] {
    const cached = this.textAttributes.get(_class)
    if (cached) return cached

    const keys = this.modelDb
      .getAllAttributes(_class)
      .filter((attr) => attr[1].type._class === CORE_CLASS_STRING)
      .map((attr) => attr[0])
    this.textAttributes.set(_class, keys)
    return keys
  }

  private getArrayAttributes (_class: Ref<Class<Obj>>): ClassKey[] {
    const cached = this.arrayAttributes.get(_class)
    if (cached) return cached

    const keys = this.modelDb
      .getAllAttributes(_class)
      .filter((attr) => attr[1].type._class === CORE_CLASS_ARRAY_OF && (attr[1].type as ArrayOf).of._class === CORE_CLASS_INSTANCE_OF)
      .map((attr) => {
        return {
          key: attr[0],
          _class: ((attr[1].type as ArrayOf).of as InstanceOf<Emb>).of
        } as ClassKey
      })
    this.arrayAttributes.set(_class, keys)
    return keys
  }

  private backlinksFromMessage (message: string, pos: number): Backlink[] {
    const result: Backlink[] = []
    traverseMessage(parseMessage(message) as MessageNode, (el) => {
      traverseMarks(el, (m) => {
        if (m.type === MessageMarkType.reference) {
          const rm = m as ReferenceMark
          result.push({
            _backlinkId: rm.attrs.id as Ref<Doc>,
            _backlinkClass: rm.attrs.class as Ref<Class<Doc>>,
            pos
          })
        }
      })
    })
    return result
  }

  private backlinks (
    _class: Ref<Class<Obj>>,
    obj: AnyLayout,
    pos: number
  ): Backlink[] {
    const attributes = this.getTextAttributes(_class)
    const backlinks = []
    for (const attr of attributes) {
      backlinks.push(...this.backlinksFromMessage((obj as any)[attr], pos))
    }
    return backlinks
  }

  async tx (ctx: TxContext, tx: Tx): Promise<any> {
    switch (tx._class) {
      case CORE_CLASS_CREATE_TX:
        return this.onCreate(ctx, tx as CreateTx)
      default:
        console.log('not implemented text tx', tx)
    }
  }

  async onCreate (ctx: TxContext, create: CreateTx): Promise<any> {
    const backlinks = this.backlinks(create._objectClass, create.object, -1)
    const arrays = this.getArrayAttributes(create._objectClass)
    for (const attr of arrays) {
      const arr = (create.object as any)[attr.key]
      if (arr) {
        for (let i = 0; i < arr.length; i++) {
          backlinks.push(...this.backlinks(attr._class, arr[i], i))
        }
      }
    }
    if (backlinks.length === 0) {
      return
    }
    const doc: Backlinks = {
      _class: CORE_CLASS_BACKLINKS,
      _id: generateId() as Ref<Backlinks>,
      _objectClass: create._objectClass,
      _objectId: create._objectId,
      backlinks
    }
    return this.storage.store(ctx, doc)
  }
}
