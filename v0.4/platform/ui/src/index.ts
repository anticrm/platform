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

import type { AnyComponent, AnySvelteComponent, DocumentProvider, Location, UIService } from './types'
import ui, { ApplicationRouter, Document } from './types'

import { derived, Readable, writable } from 'svelte/store'

export type { AnyComponent } from './types'
export { applicationShortcutKey } from './utils'

import Root from './components/Root.svelte'

import { store } from './stores'

// import Spinner from './components/internal/Spinner.svelte'
// import Icon from './components/Icon.svelte'
import { locationToUrl, parseLocation } from './location'
import { SvelteComponent, getContext, onDestroy, setContext } from 'svelte'

// platform.setResource(ui.component.Icon, Icon)
// platform.setResource(ui.component.Spinner, Spinner)

export function createApp (target: HTMLElement): SvelteComponent {
  return new Root ({ target })
}


// function showModal (component: AnySvelteComponent, props: any, element?: HTMLElement): void {
//   store.set({ is: component, props, element: element })
// }

// function closeModal (): void {
//   store.set({ is: undefined, props: {}, element: undefined })
// }

// let documentProvider: DocumentProvider | undefined

// async function open (doc: Document): Promise<void> {
//   if (documentProvider != null) {
//     return await documentProvider.open(doc)
//   }
//   return await Promise.reject(new Error('Document provider is not registred'))
// }

// function selection (): Document | undefined {
//   if (documentProvider != null) {
//     return documentProvider.selection()
//   }
//   return undefined
// }

// function registerDocumentProvider (provider: DocumentProvider): void {
//   documentProvider = provider
// }
