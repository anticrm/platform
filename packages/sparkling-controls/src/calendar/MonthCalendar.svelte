<!--
// Copyright © 2021 Anticrm Platform Contributors.
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
-->
<script type="ts">
  import Button from '@anticrm/sparkling-controls/src/Button.svelte'
  import {
    areDatesEqual,
    day,
    firstDay,
    getMonthName,
    getWeekDayName,
    incrementMonth,
    isWeekend,
    weekday
  } from './internal/DateUtils'

  export let mondayStart = false
  export let weekFormat: 'narrow' | 'short' | 'long' | undefined = 'short'
  export let cellHeight: number | undefined = undefined
  export let selectedDate: Date | undefined = undefined
  export let todayDate: Date = new Date()
  export let currentDate: Date = selectedDate || todayDate
  export let firstDayOfCurrentMonth: Date = firstDay(currentDate, mondayStart)
  export let displayedWeeksCount = 6

  function onSelect (date: Date) {
    selectedDate = date
  }

  function incMonth (count: number) {
    if (count) {
      currentDate = incrementMonth(currentDate, count)
      firstDayOfCurrentMonth = firstDay(currentDate, mondayStart)
    }
  }
</script>

<div class="month-calendar">
  <div class="selected-month-controller">
    <Button size="small" on:click={() => incMonth(-1)}>&lt;</Button>
    <div class="month-name">{`${getMonthName(currentDate)} ${currentDate.getFullYear()}`}</div>
    <Button size="small" on:click={() => incMonth(1)}>&gt;</Button>
  </div>
  <div class="days-of-week-header">
    {#each [...Array(7).keys()] as dayOfWeek}
      <div class="day-name">{getWeekDayName(day(firstDayOfCurrentMonth, dayOfWeek), weekFormat)}</div>
    {/each}
  </div>
  <div class="days-of-month">
    {#each [...Array(displayedWeeksCount).keys()] as weekIndex}
      {#each [...Array(7).keys()] as dayOfWeek}
        <div style={`grid-column-start: ${dayOfWeek + 1}; grid-row-start: ${weekIndex + 1}`}>
          <div style={`display: flex; width: 100%; height: ${cellHeight ? `${cellHeight}px;` : '100%;'}`}>
            <div
              class="cell"
              class:weekend={isWeekend(weekday(firstDayOfCurrentMonth, weekIndex, dayOfWeek))}
              class:today={areDatesEqual(todayDate, weekday(firstDayOfCurrentMonth, weekIndex, dayOfWeek))}
              class:selected={areDatesEqual(selectedDate, weekday(firstDayOfCurrentMonth, weekIndex, dayOfWeek))}
              on:click={() => onSelect(weekday(firstDayOfCurrentMonth, weekIndex, dayOfWeek))}>
              {weekday(firstDayOfCurrentMonth, weekIndex, dayOfWeek).getDate()}
            </div>
          </div>
        </div>
      {/each}
    {/each}
    <slot />
  </div>
</div>

<style lang="scss">
  .day-name,
  .selected-month-controller {
    display: flex;
    justify-content: center;
  }
  .days-of-week-header,
  .days-of-month {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
  }
  .weekend {
    background-color: var(--theme-bg-accent-color);
  }
  .today {
    color: #a66600;
  }
  .selected {
    border-radius: 3px;
    color: var(--theme-content-dark-color);
    background-color: var(--theme-bg-dark-color);
  }
  .cell {
    height: 100%;
    width: 100%;
  }
  .cell:hover {
    border-radius: 3px;
    background-color: var(--theme-bg-dark-hover);
    color: var(--theme-content-color);
  }
  .month-name {
    font-size: 14px;
    font-weight: bold;
    margin: 0 5px;
    color: var(--theme-content-dark-color);
  }
</style>
