<script lang="ts">
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

  import type { Tx } from '@anticrm/core'
  import type { CreateTx } from '@anticrm/domains'
  import { CORE_CLASS_CREATE_TX } from '@anticrm/domains'
  import { parseMessage } from '@anticrm/text'
  import type { Message } from '../..'
  import MessageViewer from '@anticrm/presentation/src/components/MessageViewer.svelte'

  export let tx: Tx

  function getMessageText () {
    const message = ((tx as CreateTx).object as unknown) as Message
    return message.comments ? message.comments[0].message : ''
  }
</script>

{#if tx._class === CORE_CLASS_CREATE_TX}
  Написал сообщение:
  <MessageViewer message={parseMessage(getMessageText())} />
{/if}
