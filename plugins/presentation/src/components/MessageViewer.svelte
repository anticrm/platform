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

  import type { MessageMark, MessageNode, ReferenceMark } from '@anticrm/text'
  import { messageContent, MessageMarkType, MessageNodeType } from '@anticrm/text'

  import { getUIService } from '@anticrm/platform-ui'

  export let message: MessageNode
  let hrefVal = 'javascript:void(0)'

  const uiService = getUIService()

  class Style {
    bold = false
    italic = false
    strike = false

    reference: {
      state: boolean
      _id: string
      _class: string
      resolved: boolean
    } = {
      state: false,
      resolved: false,
      _id: '',
      _class: ''
    }
  }

  $: style = computedStyle(message.marks || [])

  function computedStyle (marks: MessageMark[]): Style {
    const result = new Style()
    for (const mark of marks) {
      switch (mark.type) {
        case MessageMarkType.strong:
          result.bold = true
          break
        case MessageMarkType.em:
          result.italic = true
          break
        case MessageMarkType.reference: {
          const rm: ReferenceMark = mark as ReferenceMark
          result.reference.state = true
          result.reference._id = rm.attrs.id || ''
          result.reference._class = rm.attrs.class
          result.reference.resolved = result.reference._id !== ''
          if (result.reference.resolved) {
            uiService
              .getHref({ _class: result.reference._class, _id: result.reference._id })
              .then((ref) => (hrefVal = ref))
          }
          break
        }
      }
    }
    return result
  }
</script>

{#if message.type === MessageNodeType.paragraph}
  <p>
    {#each messageContent(message) as c}
      <svelte:self message={c} />
    {/each}
  </p>
{:else if message.type === MessageNodeType.text}
  <span
    class="inline-block"
    class:bold={style.bold}
    class:italic={style.italic}
    class:resolved_reference={style.reference.resolved}
    class:unknown_reference={style.reference.state && !style.reference.resolved}>
    {#if style.reference.state}
      <!-- TODO: Add a proper click handler here-->
      <a
        href={hrefVal}
        on:click|preventDefault={() => {
          uiService.open({ _class: style.reference._class, _id: style.reference._id })
        }}>
        {message.text || ''}
      </a>
    {:else}{message.text || ''}{/if}
  </span>
{:else if message.type === MessageNodeType.list_item}
  <li>
    {#each messageContent(message) as c}
      <svelte:self message={c} />
    {/each}
  </li>
{:else if message.type === MessageNodeType.doc}
  {#each messageContent(message) as c}
    <svelte:self message={c} />
  {/each}
  <!---->
{:else if message.type === MessageNodeType.ordered_list}
  <ol type="1">
    {#each messageContent(message) as c}
      <svelte:self message={c} />
    {/each}
  </ol>
  <!---->
{:else if message.type === MessageNodeType.hard_break}
  <br />
  <!---->
{:else if message.type === MessageNodeType.bullet_list}
  <ul>
    {#each messageContent(message) as c}
      <svelte:self message={c} />
    {/each}
  </ul>
  <!---->
{/if}

<style lang="scss">
  .inline-block {
    display: inline-block;
    white-space: pre;
  }

  .bold {
    font-weight: bold;
  }

  .italic {
    font-style: italic;
  }

  .resolved_reference {
    color: lightblue;
  }

  .unknown_reference {
    color: grey;
  }
</style>
