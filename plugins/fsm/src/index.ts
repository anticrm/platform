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

import { Class, Doc, Mixin, Ref } from '@anticrm/core'
import core from '@anticrm/platform-core'
import { Plugin, plugin, Service } from '@anticrm/platform'
import { Application } from '@anticrm/domains'

export interface FSM extends Doc {
  name: string
  application: Ref<Application>
  transitions: Ref<Transition>[]
  classes: Ref<Class<Doc>>[]
}

export interface Transition extends Doc {
  from: Ref<State>
  to: Ref<State>
  // action: Ref<Action>
}

export interface WithFSM extends Doc {
  fsm: Ref<FSM>
}

export interface WithState extends Doc {
  fsm: Ref<WithFSM>
  state: Ref<State>
}

export interface State extends Doc {
  name: string
}

export interface FSMService extends Service {}

export default plugin(
  'fsm' as Plugin<FSMService>,
  { core: core.id },
  {
    class: {
      FSM: '' as Ref<Class<FSM>>,
      Transition: '' as Ref<Class<Transition>>,
      State: '' as Ref<Class<State>>
    },
    mixin: {
      WithFSM: '' as Ref<Mixin<WithFSM>>,
      WithState: '' as Ref<Mixin<WithState>>
    }
  }
)