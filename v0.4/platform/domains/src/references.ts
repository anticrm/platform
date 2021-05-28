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

import { Class, Doc, Emb, Ref } from '@anticrm/core'
import { VDoc } from './vdoc'

// R E F E R E N C E S
export const REFERENCE_DOMAIN = 'references'

/**
 * A reference object from and source to any target
 *
 * source - define a source object with class and properties.
 * target - define a target object with class and properties.
 */
export interface Reference extends Doc {
  _sourceId: Ref<Doc> // Source Object identifier, if from Item
  _sourceClass: Ref<Class<Doc>> //

  _itemId?: Ref<Emb> // If specified reference from collection item of object `source`.
  _itemClass?: Ref<Class<Emb>> // Source field class
  _collection?: string // A collection name

  _sourceField: string // A field we have reference from
  _sourceIndex: number // Index inside a field, if multiple references.

  _targetId?: Ref<Doc> // We could reference both documents and embedded ones.
  _targetClass: Ref<Class<Doc>>
}

/**
 * Define a list of space references for this object, this is a mixin.
 */
export interface ShortID extends VDoc {
  /**
   * A useful short Id for this object.
   */
  shortId: string
}
