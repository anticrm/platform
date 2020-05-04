//
// Copyright © 2020 Andrey Platov <andrey.v.platov@gmail.com>
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

import { Ref, Obj, Class, IntlString } from './types'

export function classLabelId(clazz: Ref<Class<Obj>>): IntlString {
  return clazz as string as IntlString
}

export function attributeLabelId(clazz: Ref<Class<Obj>>, key: string): IntlString {
  return clazz + '.' + key as IntlString
}

export function mixinPropertyKey(clazz: Ref<Class<Obj>>): string {
  return '$' + clazz
}