//
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
//

import { Metadata, plugin, Plugin, Resource, Service } from '@anticrm/platform'
import { Readable } from 'svelte/store'

export type URL = string
export type Asset = Metadata<URL>

// export type SvelteConstructor = object

interface ComponentOptions<Props> {
  target: HTMLElement
  anchor?: HTMLElement
  props?: Props
  hydrate?: boolean
  intro?: boolean
}

interface SvelteComponent<Props> {
  new(options: ComponentOptions<Props>): any
  $set: (props: {}) => any
  $on: (event: string, callback: (event: CustomEvent) => any) => any
  $destroy: () => any
  render: (props?: {}) => {
    html: string
    css: { code: string; map?: string }
    head?: string
  }
}

export type AnySvelteComponent = SvelteComponent<{}>

export type Component<C extends AnySvelteComponent> = Resource<C>
export type AnyComponent = Component<AnySvelteComponent>

export const CONTEXT_PLATFORM = 'platform'
export const CONTEXT_PLATFORM_UI = 'platform-ui'

export interface Location {
  pathname: string
  search: string
}

export interface UIService extends Service {
  createApp (root: HTMLElement): any
  getLocation (): Readable<Location>
  navigate (url: string): void
  showModal (component: AnySvelteComponent, props: any, element?: HTMLElement): void
  closeModal (): void
}

export default plugin('ui' as Plugin<UIService>, {}, {
  metadata: {
    DefaultApplication: '' as Metadata<AnyComponent>
  },
  icon: {
    Default: '' as Asset,
    Error: '' as Asset,
    Network: '' as Asset,
    Search: '' as Asset,
    Add: '' as Asset,
  },
  component: {
    Icon: '' as AnyComponent,
    Spinner: '' as AnyComponent,
    BadComponent: '' as AnyComponent
  },
  method: {
    AnAction: '' as Resource<(args: any) => void>
  }
})
