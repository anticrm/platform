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

/* eslint-env jest */

import { Platform } from '@anticrm/platform'
import startPlugin from '../plugin'
import model from '../__model__/model'
import Builder from '../__model__/builder'
import core from '../__model__'
import {mergeIds} from "../__model__/utils";
const DOC = 1 // see `plugin.ts`

describe('core', () => {
  const platform = new Platform()

  it('should load model', async () => {
    const tx = await startPlugin(platform)
    const builder = new Builder(tx.getDb())
    builder.load(model)
    const coreModel = builder.dump()
    expect(true).toBe(true)
    console.log(JSON.stringify(coreModel))
  })

  it('should create prototype', async () => {
    const tx = await startPlugin(platform)
    const builder = new Builder(tx.getDb())
    builder.load(model)

    const typeProto = await tx.getPrototype(core.class.Type, DOC)
    console.log(typeProto)

    const rtProto = await tx.getPrototype(core.class.StaticResource, DOC)
    console.log(rtProto)

    const rtProtoProto = Object.getPrototypeOf(rtProto)
    expect(typeProto).toBe(rtProtoProto)

    const bagProto = await tx.getPrototype(core.class.BagOf, DOC)
    console.log(bagProto)
  })

  it('should instantiate class', async () => {
    const tx = await startPlugin(platform)
    const builder = new Builder(tx.getDb())
    builder.load(model)

    const inst = await tx.getInstance(core.class.RefTo)
    const x = inst._attributes
    const to = await x.to
    // TODO: understand problem
    expect((to as any)._class).toBe(core.class.RefTo)
    //    expect((inst._attributes.to as Instance<Emb>)._class).toBe(core.class.RefTo)
  })

  it('should instantiate array', async () => {
    const tx = await startPlugin(platform)
    const builder = new Builder(tx.getDb())
    builder.load(model)

    // console.log(tx.getDb().dump())

    const result = await tx.find(core.class.Class, {})
    console.log(result)
  })

  it('should merge ids', () => {

    let mm1 : { [key: string]: { [key: string]: any } } = {}
    mm1['k1'] = ['value11', 'value12']
    let mm2 : { [key: string]: { [key: string]: any } } = {}
    mm2['k2'] = ['value21', 'value22']
    let mi = mergeIds(mm1, mm2)
    expect(mi.k1).toStrictEqual(['value11', 'value12'])
    expect(mi.k2).toStrictEqual(['value21', 'value22'])
  })
})
