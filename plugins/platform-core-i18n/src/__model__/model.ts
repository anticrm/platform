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

import { Doc, Type, Class, Ref, Session } from '@anticrm/platform-core'
import core from '@anticrm/platform-core/src/__model__'

import i18n from '.'

export default (S: Session): Doc[] => {
  return [
    S.createClass<Type<string>, Type<string>>({
      _id: i18n.class.IntlString,
      _attributes: {
        exert: S.newInstance(core.class.ResourceType, {
          _default: i18n.method.IntlString_exert
        })
      },
      _extends: core.class.Type
    }),
  ]
}