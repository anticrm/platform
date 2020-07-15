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

import { Class, CoreDomain, Doc, MemDb, Obj, Platform, Ref } from '@anticrm/platform'
import core, { CoreService } from '.'

/*!
 * Anticrm Platform™ Core Plugin
 * © 2020 Anticrm Platform Contributors. All Rights Reserved.
 * Licensed under the Eclipse Public License, Version 2.0
 */
export default async (platform: Platform): Promise<CoreService> => {
  const model = new MemDb(CoreDomain.Model)
  const offline = platform.getMetadata(core.metadata.Model)
  if (offline) {
    model.loadModel(offline[CoreDomain.Model])
  } else {
    throw new Error('not implemented')
  }

  return {
    getModel () {
      return model
    },

    is (obj: Obj, _class: Ref<Class<Obj>>): boolean {
      return model.is(obj._class, _class)
    },

    isMixedIn (obj: Doc, _class: Ref<Class<Doc>>): boolean {
      return obj._mixins ? obj._mixins.includes(_class) : false
    }
  }
}
