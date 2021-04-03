<!--
Copyright © 2020, 2021 Anticrm Platform Contributors.

Licensed under the Eclipse Public License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may
obtain a copy of the License at https://www.eclipse.org/legal/epl-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.

See the License for the specific language governing permissions and
limitations under the License.
-->
<script lang="ts">
  import type { Person } from '@anticrm/contact'

  import { getCoreService, liveQuery } from '@anticrm/presentation'

  import UserInfo from '@anticrm/sparkling-controls/src/UserInfo.svelte'
  import ResumeProps from '@anticrm/person-extras/src/components/ResumeProps.svelte'

  import type { WithCandidateProps } from '..'
  import candidatePlugin from '..'

  const core = getCoreService()
  const model = core.then((s) => s.getModel())

  export let object: WithCandidateProps
  let person: Person | undefined
  let candidate: WithCandidateProps['candidate'] | undefined
  let resume: WithCandidateProps['resume'] | undefined

  $: lq = liveQuery(lq,
    candidatePlugin.mixin.WithCandidateProps, { _id: object._id },
    (docs) => {
      person = docs[0]
      const candidateMixin = docs[0]
      candidate = candidateMixin?.candidate
      resume = candidateMixin?.resume
    }
  )
</script>

<div class="root">
  {#if person && candidate}
    <div class="header">
      <UserInfo
        url={`https://robohash.org/${person.name}.png?set=set3`}
        title={person.name}
        subtitle={candidate.role}
      />
    </div>
    <div>
      Email: {person.email}
    </div>
    {#if person.birthDate}
      <div>
        Birth date: {person.birthDate}
      </div>
    {/if}
    <div>
      Bio: {candidate.bio}
    </div>
    <div>
      Role: {candidate.role}
    </div>
    <div>
      Expected salary: {candidate.salaryExpectation}
    </div>
  {/if}
  {#if resume}
    <ResumeProps {resume} />
  {/if}
</div>

<style lang="scss">
  .root {
    display: grid;
    grid-template-columns: auto;
    grid-gap: 10px;
  }
</style>