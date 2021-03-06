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
  import type { Class, Doc, Ref } from '@anticrm/core'
  import type { AnyComponent } from '@anticrm/platform-ui'
  import Component from '@anticrm/platform-ui/src/components/Component.svelte'
  import presentation, { getComponentExtension, liveQuery } from '@anticrm/presentation'
  import { createEventDispatcher } from 'svelte'

  import Icon from '@anticrm/platform-ui/src/components/Icon.svelte'
  import workbench from '../..'
  import ScrollView from '@anticrm/sparkling-controls/src/ScrollView.svelte'
  import { QueryUpdater } from '@anticrm/platform-core'

  export let _class: Ref<Class<Doc>>
  export let _objectId: Ref<Doc>

  let object: Doc | undefined

  const dispatch = createEventDispatcher()

  let queryUpdate: Promise<QueryUpdater<Doc>>

  $: queryUpdate = liveQuery<Doc>(queryUpdate, _class, { _id: _objectId }, (docs) => {
    object = docs.length > 0 ? docs[0] : undefined
    if (!object) {
      console.log(`NO objects found based on ${_class} ${_objectId}`)
      dispatch('noobject')
    }
  })

  let component: AnyComponent
  $: {
    getComponentExtension(_class, presentation.mixin.DetailForm).then((ext) => {
      if (ext !== undefined && component !== ext) {
        component = ext
      }
    })
  }
</script>

{#if object}
  <div class="recruiting-view">
    <div class="toolbar">
      <a
        href="/"
        on:click|preventDefault={() => {
          dispatch('close')
        }}>
        <Icon icon={workbench.icon.Close} button={true} />
      </a>
    </div>
    <div class="content">
      <ScrollView height="100%" width="100%">
        <div class="component-content">
          <Component is={component} props={{ _class, object }} on:open />
        </div>
      </ScrollView>
    </div>
  </div>
{/if}

<style lang="scss">
  .recruiting-view {
    margin-top: 1em;
    // width: calc(404px);
    width: 100%;
    position: relative;
    height: 95%;

    .toolbar {
      display: flex;
      flex-direction: row-reverse;
      margin: 1em;
    }

    .content {
      height: 95%;
    }

    .component-content {
      padding: 2em;
    }
  }
</style>
