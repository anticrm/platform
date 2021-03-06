<script lang="ts">
  import { spring } from 'svelte/motion'
  import type { CardDragEvent, PanEndEvent, PanMoveEvent, PanStartEvent, Pos } from './cardHelper'
  import { pannable } from './cardHelper'
  import { createEventDispatcher } from 'svelte'
  import type { Task } from '@anticrm/task'
  import { Doc } from '@anticrm/core'
  import { AnyComponent } from '@anticrm/platform-ui'
  import Component from '@anticrm/platform-ui/src/components/Component.svelte'

  export let doc: Doc
  export let duplicate = false
  export let presenter: AnyComponent

  let dragSource: HTMLElement
  let drag = false

  let originalWidth = 0
  let originalHeight = 0
  let beforeDragWidth = 0
  let beforeDragHeight = 0
  let sourceY = 0

  const dispatch = createEventDispatcher()

  const coords = spring<Pos>(
    { x: 0, y: 0 },
    {
      stiffness: 0.2,
      damping: 0.4
    }
  )

  function handlePanStart (event: PanStartEvent) {
    coords.stiffness = coords.damping = 1
    drag = true

    beforeDragWidth = originalWidth - 2
    beforeDragHeight = originalHeight - 2

    sourceY = dragSource.parentElement.scrollTop
    coords.set({ x: 0, y: -1 * sourceY })
    dispatch('drag', { doc, dragged: true, event } as CardDragEvent<Task>)
  }

  function handlePanMove (event: PanMoveEvent) {
    coords.update(() => ({
      x: ($coords.x as number) + event.detail.dx,
      y: ($coords.y as number) + event.detail.dy
    }))
    dispatch('move', { doc, dragged: true, coords: $coords, event: event } as CardDragEvent<Doc>)
  }

  function handlePanEnd (event: PanEndEvent) {
    coords.stiffness = 0.4
    coords.damping = 0.8
    coords.set({ x: 0, y: 0 })
    drag = false
    dispatch('drag', { doc, dragged: false } as CardDragEvent<Doc>)
    dispatch('move', { doc, dragged: false, coords: $coords, event: event } as CardDragEvent<Doc>)
  }

  function calcStyle (coords: Pos, width: number, height: number): string {
    return `width: ${drag ? width.toString() + 'px' : 'inherit'};
            height: ${drag ? height.toString() + 'px' : 'inherit'};
            transform:
              translate(${coords.x}px,${coords.y}px)
              rotate(${coords.x * 0.01}deg);`
  }
</script>

{#if duplicate}
  <div class="card-view" class:duplicate>
    <Component is={presenter} props={{ doc }} />
  </div>
{:else}
  <div bind:this={dragSource} bind:clientWidth={originalWidth} bind:clientHeight={originalHeight}>
    <div
      class="card-view"
      class:drag
      use:pannable
      on:panstart={handlePanStart}
      on:panmove={handlePanMove}
      on:panend={handlePanEnd}
      style={calcStyle($coords, originalWidth, originalHeight)}>
      <Component is={presenter} props={{ doc }} />
    </div>
    {#if drag}
      <div class="place-box" style={`width: ${beforeDragWidth}px; height: ${beforeDragHeight}px;`} />
    {/if}
  </div>
{/if}

<style lang="scss">
  .card-view {
    max-width: 300px;
    border-radius: 4px;
    display: flex;
    flex-direction: column;
    background-color: var(--theme-bg-color);
    border: 1px solid var(--theme-bg-color);
    transition: border-color 0.3s ease-in, box-shadow 0.3s ease-in;
  }

  .place-box {
    position: relative;
    border: dashed 1px transparent;
    margin-bottom: 2px;
    border-color: var(--theme-bg-dark-color);
  }

  .drag {
    position: fixed;
    border-color: var(--theme-bg-dark-color);
    box-shadow: var(--theme-shadow);
    z-index: 1000;
  }

  .duplicate {
    padding-top: 1em;
    opacity: 0.9;
    border-color: var(--theme-bg-dark-color);
    z-index: 900;
  }
</style>
