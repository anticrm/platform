<script lang="ts">
  export let url = ''
  export let title = ''
  export let subtitle = ''
  export let color = ''
  export let userColor = ''
  export let subtitleOnTop = false
</script>

<div class="userInfo">
  {#if url}
    <img class="avatar" src={url} alt="" />
  {/if}
  <div class="user" style={userColor !== '' ? 'color:' + userColor : ''}>
    {#if !subtitleOnTop}
      {title}
    {/if}
    {#if subtitle !== ''}
      <span style={color !== '' ? 'color:' + color : ''}>{subtitle}</span>
    {/if}
    {#if subtitleOnTop}
      {title}
    {/if}
  </div>
</div>

<style lang="scss">
  .userInfo {
    display: flex;
    flex-direction: row;
    align-items: center;
  }
  .avatar {
    width: 32px;
    height: 32px;
    border: 1px solid transparent;
    border-radius: 16px;
    border-color: var(--theme-content-trans-color);
  }

  .user {
    padding-left: 1em;
    font-size: 14px;
    font-weight: 500;
    line-height: 18px;
    color: var(--theme-userlink-color);
    & > span {
      display: block;
      font-size: 11px;
      line-height: 14px;
      color: var(--theme-status-grey-color);
    }
  }
</style>
