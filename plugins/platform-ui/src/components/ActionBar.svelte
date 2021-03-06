<script lang="ts">
  import Icon from './Icon.svelte'
  import ui from '../'
  import type { Action } from '..'

  export let onTop = 2
  export let actions: Action[] = []

  function getStyle (pos: number, total: number, onTop: number): string {
    if (total === 1) {
      return 'w100' // A full row, since one item
    }
    if (pos === 0) {
      return 'abLeft w100'
    }
    if (pos === total - 1 && total === onTop) {
      // All items are on top, we need to add right style
      return 'abRight w100'
    }
    if (pos < onTop) {
      return 'abCenter w100'
    }
    return 'popup-item'
  }

  // Popup
  let thisPopup: HTMLElement
  let thisTrigger: HTMLElement
  let visible = false

  function handleAction (action: Action) {
    action.action?.()
  }
</script>

<svelte:window
  on:click={() => {
    visible = false
  }} />
<div class="actionBar-view">
  {#each actions.slice(0, onTop) as item}
    <button
      class="button actionButton {getStyle(actions.indexOf(item), actions.length, onTop)}"
      class:toggleState={item.toggleState}
      on:click={() => {
        if (item.action) item.action()
        visible = false
      }}>{item.name}</button>
  {/each}
  {#if actions.length - onTop > 0}
    <button
      bind:this={thisTrigger}
      class="button actionButton abRight w100 wOther"
      class:selected={visible}
      on:click|stopPropagation={() => {
        visible = !visible
      }}>
      <div class="chevron">
        <span>Ещё</span>
        <Icon icon={ui.icon.ArrowDown} />
      </div>
      {#if visible}
        <div bind:this={thisPopup} class="popup-menu-view">
          {#each actions.slice(onTop) as popup}
            {#if popup.name === '-'}
              <div class="popup-separator" />
            {:else}
              <button class="popup-item" on:click={() => handleAction(popup)}>{popup.name}</button>
            {/if}
          {/each}
        </div>
      {/if}
    </button>
  {/if}
</div>

<style lang="scss">
  .actionBar-view {
    display: flex;
    flex-direction: row;
    margin: 1em 0;
  }

  .error {
    width: 100%;
    text-align: center;
    font-weight: 500;
    border-radius: 4px;
    color: var(--theme-status-maroon-color);
    background-color: var(--theme-bg-accent-color);
  }

  .actionButton {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.25em;
    color: var(--theme-content-dark-color);
  }

  .abLeft {
    border-radius: 4px 0 0 4px;
    border-right: none;
  }

  .abCenter {
    border-radius: 0px;
    border-right: none;
  }

  .abRight {
    border-radius: 0 4px 4px 0;
  }

  .selected {
    background-color: var(--theme-bg-accent-hover);
    border-color: var(--theme-bg-dark-hover);
  }

  .toggleState {
    font-weight: bold;
    background-color: var(--theme-bg-dark-color);
  }
  .popup-separator {
    height: 1px;
    background-color: var(--theme-bg-dark-color);
  }

  .w100 {
    flex-basis: 100%;
    width: 100%;
  }

  .wOther {
    display: block;

    .chevron {
      width: 100%;
      height: 100%;
      align-items: center;
      justify-content: center;
      display: flex;
    }

    .popup-menu-view {
      position: relative;
      display: flex;
      flex-direction: column;
      flex-flow: column nowrap;
      border-radius: 4px;
      padding: 4px 8px;
      margin: 10px -0.25em 0 -0.25em;
      background-color: var(--theme-bg-accent-color);
      border: solid 1px var(--theme-bg-dark-color);
      box-shadow: var(--theme-shadow);
      z-index: 100000;

      .popup-item {
        margin: 4px 0;
        padding: 8px;
        width: 100%;
        text-align: left;
        border-radius: 4px;
        border: none;
        cursor: pointer;
        background-color: var(--theme-bg-accent-color);
        color: var(--theme-content-dark-color);
        &:hover {
          background-color: var(--theme-bg-accent-hover);
        }
      }
    }
  }
</style>
