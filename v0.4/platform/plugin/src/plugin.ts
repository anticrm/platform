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

import { Status, Severity} from '@anticrm/status'
import { monitor } from './event'

/** Base interface for a plugin or platform service. */
export interface Service {} // eslint-disable-line @typescript-eslint/no-empty-interface

/** Plugin identifier. */
export type Plugin<S extends Service> = string & { __plugin: S }
type AnyPlugin = Plugin<Service>

/** A list of dependencies e.g. `{ core: core.id, ui: ui.id }`. */
export interface PluginDependencies {
  [key: string]: AnyPlugin
}

/**
 * Convert list of dependencies to a list of provided services,
 * e.g. `PluginServices<{core: core.id}> === {core: CoreService}`
 */
export type PluginServices<T extends PluginDependencies> = {
  [P in keyof T]: T[P] extends Plugin<infer Service> ? Service : T[P]
}

/**
 * A Plugin Descriptor, literally plugin ID + dependencies.
 */
export interface PluginDescriptor<S extends Service, D extends PluginDependencies> {
  id: Plugin<S>
  deps: D
}
type AnyDescriptor = PluginDescriptor<Service, PluginDependencies>

type PluginModule<P extends Service, D extends PluginDependencies> = {
  default: (deps: PluginServices<D>) => Promise<P>
}
type AnyPluginModule = PluginModule<Service, PluginDependencies>

type PluginLoader<P extends Service, D extends PluginDependencies> = () => Promise<PluginModule<P, D>>
type AnyPluginLoader = PluginLoader<Service, PluginDependencies>

const plugins = new Map<AnyPlugin, Promise<Service>>()
const locations = [] as Array<[AnyDescriptor, AnyPluginLoader]>
const running = new Map<AnyPlugin, Service>()

export function addLocation<P extends Service, X extends PluginDependencies> (
  plugin: PluginDescriptor<P, X>,
  module: PluginModule<P, X>
): void {
  locations.push([plugin, module as any])
}

export async function getPlugin<T extends Service> (id: Plugin<T>): Promise<T> {
  const plugin = plugins.get(id)
  if (plugin !== undefined) {
    return (await plugin) as T
  } else {
    const plugin = resolvePlugin(id)
    try {
      plugins.set(id, plugin)
      ;(await plugin) as Promise<T>
    } catch (ex) {
      // remove plugin, and try on next attempt.
      plugins.delete(id)
    }
    return (await plugin) as T
  }
}

function getLocation (id: AnyPlugin): [AnyDescriptor, AnyPluginLoader] {
  for (const location of locations) {
    if (location[0].id === id) {
      return location
    }
  }
  throw new Error('no location provided for plugin: ' + id)
}

async function resolveDependencies (
  parentId: Plugin<any>,
  deps: PluginDependencies
): Promise<{ [key: string]: Service }> {
  const result: { [key: string]: Service } = {}
  for (const key in deps) {
    const id = deps[key]
    result[key] = await getPlugin(id)
  }
  return result
}

async function resolvePlugin<T extends Service> (id: Plugin<T>): Promise<Service> {
  const location = getLocation(id)
  const deps = await resolveDependencies(id, location[0].deps)

  let loaderPromise
  
  if (id !== 'ui') {
    loaderPromise = new Promise<AnyPluginModule>((resolve, reject) => {
      setInterval(() => {
        location[1]().then(result => resolve(result)).catch(err => reject(err))
      }, 3000)
    })  
  } else {
    loaderPromise = location[1]()
  }

  const status = new Status(Severity.INFO, 0, `Loading module '<b>${id}</b>'...`)
  const loadedPlugin = await monitor(status, loaderPromise)
  const f = loadedPlugin.default
  const service = await f(deps)
  running.set(id, service)
  return service
}

// I D E N T I T Y

type Namespace = Record<string, Record<string, any>>

function transform<N extends Namespace> (plugin: AnyPlugin, namespaces: N, f: (id: string, value: any) => any): N {
  const result: Namespace = {}
  for (const namespace in namespaces) {
    const extensions = namespaces[namespace]
    const transformed: Record<string, any> = {}
    for (const key in extensions) {
      transformed[key] = f(namespace + ':' + plugin + '.' + key, extensions[key])
    }
    result[namespace] = transformed
  }
  return result as N
}

export function identify<N extends Namespace> (pluginId: AnyPlugin, namespace: N): N {
  return transform(pluginId, namespace, (id: string, value) => (value === '' ? id : value))
}

export function plugin<P extends Service, D extends PluginDependencies, N extends Namespace> (
  id: Plugin<P>,
  deps: D,
  namespace: N
): PluginDescriptor<P, D> & N {
  return {
    id,
    deps,
    ...identify(id, namespace)
  }
}