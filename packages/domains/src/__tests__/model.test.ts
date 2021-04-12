//
// Copyright © 2020, 2021 Anticrm Platform Contributors.
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

import { Model } from '@anticrm/core'
import { data, taskIds } from '@anticrm/core/src/__tests__/tasks'
import { txBuilder, TxOperationKind } from '../index'

describe('core tests', () => {
  const model = new Model('vdocs')
  model.loadModel(data)

  it('create object selector ', () => {
    const s = txBuilder(taskIds.class.Task)

    expect(s.tasks?.match({ name: 'qwe' }).build()).toEqual([{
      key: 'tasks',
      pattern: { name: 'qwe' }
    }])
  })
  it('create multiple object selector ', () => {
    const s = txBuilder(taskIds.class.Task)

    expect(s.tasks?.match({ name: 'qwe' }).comments?.build()).toEqual([
      {
        key: 'tasks',
        pattern: { name: 'qwe' }
      },
      {
        key: 'comments'
      }])
  })
  it('create object set operation ', () => {
    const s = txBuilder(taskIds.class.Task)

    expect(s.tasks?.match({ name: 'qwe' }).comments?.set({ message: 'comment msg' })).toEqual({
      kind: TxOperationKind.Set,
      _attributes: {
        message: 'comment msg'
      },
      selector: [{
        key: 'tasks',
        pattern: { name: 'qwe' }
      }, {
        key: 'comments'
      }]
    })
  })
  it('create multiple operations ', () => {
    const s = txBuilder(taskIds.class.Task)

    expect(s.tasks?.match({ name: 'qwe' }).comments?.set({ message: 'comment msg' })).toEqual({
      kind: TxOperationKind.Set,
      _attributes: {
        message: 'comment msg'
      },
      selector: [{
        key: 'tasks',
        pattern: { name: 'qwe' }
      }, {
        key: 'comments'
      }]
    })
    expect(s.comments?.match({ message: 'qwe' }).set({ message: 'comment msg' })).toEqual({
      kind: TxOperationKind.Set,
      _attributes: {
        message: 'comment msg'
      },
      selector: [{
        key: 'comments',
        pattern: { message: 'qwe' }
      }]
    })
  })

  it('check named attribute update', () => {
    const s = txBuilder(taskIds.class.Task)
    const fieldName = 'description'
    expect(s.set({ [fieldName]: 'someValue' })).toEqual({
      kind: TxOperationKind.Set,
      _attributes: {
        description: 'someValue'
      }
    })
  })
})
