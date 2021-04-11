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

/* eslint-env jest */

import { Severity, Status } from '@anticrm/status'
import { createPlatform, getResourceInfo, identify, Metadata, PlatformStatus, Plugin, Resource, Service } from '..'

import { descriptor1, descriptor2, descriptor3, plugin1, plugin1State, plugin2State, plugin3 } from './shared'

type AnyPlugin = Plugin<Service>

type ExtractType<T, X extends Record<string, Metadata<T>>> = {
  [P in keyof X]: X[P] extends Metadata<infer Z> ? Z : never
}

describe('platform', () => {
  const platform = createPlatform()

  it('should identify resources', () => {
    const ids = identify('test' as AnyPlugin, {
      resource: {
        MyString: '' as Metadata<string>,
        FixedId: 'my-id' as Metadata<string>
      }
    })
    expect(ids.resource.MyString).toBe('resource:test.MyString')
    expect(ids.resource.FixedId).toBe('my-id')
  })

  it('should raise exception for unknown location', () => {
    const p1 = platform.getPlugin(plugin1)
    expect(p1).rejects.toThrowError('plugin1') // eslint-disable-line @typescript-eslint/no-floating-promises
  })

  it('should resolve plugin', async () => {
    platform.addLocation(descriptor1, async () => await import('./plugin1'))
    expect(plugin1State.parsed).toBe(false)
    expect(plugin1State.started).toBe(false)
    const p1 = platform.getPlugin(plugin1)
    expect(p1).toBeInstanceOf(Promise)
    expect(plugin1State.parsed).toBe(false)
    expect(plugin1State.started).toBe(false)
    return await p1.then(() => {
      expect(plugin1State.parsed).toBe(true)
      expect(plugin1State.started).toBe(true)
    })
  })

  it('should not resolve resource (no plugin location)', (done) => {
    platform
      .getResource('resource:NotExists.Resource' as Resource<string>)
      .then((res) => {
        // eslint-disable-line
        expect(true).toBe(false)
        done()
      })
      .catch((err) => {
        expect(err).toBeInstanceOf(Error)
        done()
      })
  })

  it('should resolve resource', async () => {
    platform.addLocation(descriptor2, async () => await import('./plugin2'))
    // platform.setResolver('resource2', plugin2)
    expect(plugin2State.parsed).toBe(false)
    expect(plugin2State.started).toBe(false)
    let resolved = platform.getResource('resource2:plugin2.Resource' as Resource<string>)
    expect(resolved).toBeInstanceOf(Promise)
    // get again to check repeated getting
    resolved = platform.getResource('resource2:plugin2.Resource' as Resource<string>)
    return await resolved.then((resource) => {
      expect(resource).toBe('hello resource2:My.Resource')
      expect(plugin2State.parsed).toBe(true)
      expect(plugin2State.started).toBe(true)
    })
  })

  it('should resolve resource second time', async () => {
    const resolved = platform.getResource('resource2:plugin2.Resource' as Resource<string>)
    expect(resolved).toBeInstanceOf(Promise)
    return await resolved.then((resource) => {
      expect(resource).toBe('hello resource2:My.Resource')
    })
  })

  it('should fail to resolve wrong resource', (done) => {
    const wrongResource = 'resource_wrong:plugin2.Resource' as Resource<string>
    platform
      .getResource(wrongResource)
      .then((res) => {
        // eslint-disable-line
        expect(true).toBe(false)
        done()
      })
      .catch((err) => {
        expect(err).toBeInstanceOf(Error)
        expect(err.message).toBe(`resource not loaded: ${wrongResource}`)
        done()
      })
  })

  it('should inject dependencies', async () => {
    platform.addLocation(descriptor3, async () => await import('./plugin3'))
    const p3 = platform.getPlugin(plugin3)
    return await p3.then((plugin) => {
      const deps = (plugin as any).deps
      expect(deps.plugin1.id).toBe('plugin1')
      expect(deps.plugin2.id).toBe('plugin2')
    })
  })

  it('should fail to get resource info', () => {
    expect(() => getResourceInfo('bad resource definition' as Resource<string>)).toThrowError(
      'invalid resource id format'
    )
  })

  it('should peek resource', () => {
    const resource = 'resource' as Resource<string>
    expect(platform.peekResource(resource)).toBeUndefined()
    platform.setResource(resource, 'value')
    expect(platform.peekResource(resource)).toBe('value')
  })

  it('should set resource', async () => {
    platform.setResource('xxx' as Resource<string>, 'meta-xxx')
    const resource = await platform.getResource('xxx' as Resource<string>)
    expect(resource).toBe('meta-xxx')
  })

  it('should load metadata', () => {
    const ids = identify('test' as AnyPlugin, {
      meta: {
        M1: '' as Metadata<string>,
        M2: 'my-id' as Metadata<string>
      }
    })

    platform.loadMetadata(ids.meta, {
      M1: 'hey',
      M2: 'there'
    })

    expect(platform.getMetadata(ids.meta.M1)).toBe('hey')
    expect(platform.getMetadata(ids.meta.M2)).toBe('there')
  })

  it('should fail to load metadata', () => {
    const ids = identify('test' as AnyPlugin, {
      meta: {
        M1: 'flag' as Metadata<boolean>
      }
    })

    expect(() => platform.loadMetadata(ids.meta, {} as ExtractType<unknown, { M1: Metadata<boolean> }>)).toThrowError() // eslint-disable-line @typescript-eslint/consistent-type-assertions
  })

  it('should set metadata', () => {
    const m1 = '' as Metadata<string>
    const m2 = 'm2' as Metadata<string>

    platform.setMetadata(m1, 'hello')
    platform.setMetadata(m2, 'again')

    expect(platform.getMetadata(m1)).toBe('hello')
    expect(platform.getMetadata(m2)).toBe('again')
  })

  it('should call event listener', () => {
    let listenerCalled = false
    const myEvent = 'MyEvent'
    const myData = 'test-data'
    const myEventListener = async function (event: string, data: any): Promise<void> {
      listenerCalled = true
      expect(event).toBe(myEvent)
      expect(data).toBe(myData)
      return await Promise.resolve()
    }

    platform.addEventListener(myEvent, myEventListener)
    platform.broadcastEvent(myEvent, myData)
    expect(listenerCalled).toBe(true)

    // remove listener to avoid calls from other tests
    platform.removeEventListener(myEvent, myEventListener)
  })

  it('should call many event listeners', () => {
    class TestEventListener {
      readonly eventName: string
      readonly eventData: string
      isCalled: boolean
      listener: (event: string, data: string) => Promise<void>

      constructor (eventName: string, eventData: string) {
        this.eventName = eventName
        this.eventData = eventData
        this.isCalled = false

        this.listener = async (event: string, data: any): Promise<void> => {
          this.isCalled = true
          expect(event).toBe(this.eventName)
          expect(data).toBe(this.eventData)
          return await Promise.resolve()
        }
      }

      startListen (): void {
        platform.addEventListener(this.eventName, this.listener)
      }

      stopListen (): void {
        platform.removeEventListener(this.eventName, this.listener)
      }

      checkCalled (): void {
        expect(this.isCalled).toBe(true)
        this.isCalled = false // reset flag for futher checks
      }

      checkNotCalled (): void {
        expect(this.isCalled).toBe(false)
      }
    }

    const event1 = 'MyEvent1'
    const event2 = 'MyEvent2'
    const data1 = 'data1'
    const data2 = 'data2'

    const firstListenerForEvent1 = new TestEventListener(event1, data1)
    const secondListenerForEvent1 = new TestEventListener(event1, data1)
    const firstListenerForEvent2 = new TestEventListener(event2, data2)
    const secondListenerForEvent2 = new TestEventListener(event2, data2)

    firstListenerForEvent1.startListen()
    secondListenerForEvent1.startListen()
    firstListenerForEvent2.startListen()
    secondListenerForEvent2.startListen()

    platform.broadcastEvent(event1, data1)
    firstListenerForEvent1.checkCalled()
    secondListenerForEvent1.checkCalled()
    firstListenerForEvent2.checkNotCalled()
    secondListenerForEvent2.checkNotCalled()

    platform.broadcastEvent(event2, data2)
    firstListenerForEvent1.checkNotCalled()
    secondListenerForEvent1.checkNotCalled()
    firstListenerForEvent2.checkCalled()
    secondListenerForEvent2.checkCalled()

    platform.broadcastEvent('ArbitraryEvent', 'anydata')
    firstListenerForEvent1.checkNotCalled()
    secondListenerForEvent1.checkNotCalled()
    firstListenerForEvent2.checkNotCalled()
    secondListenerForEvent2.checkNotCalled()

    secondListenerForEvent1.stopListen()

    platform.broadcastEvent(event1, data1)
    firstListenerForEvent1.checkCalled()
    secondListenerForEvent1.checkNotCalled()
    firstListenerForEvent2.checkNotCalled()
    secondListenerForEvent2.checkNotCalled()

    firstListenerForEvent1.stopListen()
    firstListenerForEvent2.stopListen()
    secondListenerForEvent2.stopListen()

    platform.broadcastEvent(event1, data1)
    platform.broadcastEvent(event2, data2)

    firstListenerForEvent1.checkNotCalled()
    secondListenerForEvent1.checkNotCalled()
    firstListenerForEvent2.checkNotCalled()
    secondListenerForEvent2.checkNotCalled()
  })

  function testSetPlatformStatus (status: any, expectedSeverity: Severity, expectedMessage: string): void {
    let listenerCalled = false
    const listener = async function (event: string, data: any): Promise<void> {
      listenerCalled = true
      expect(event).toBe(PlatformStatus)
      expect(data).toBeInstanceOf(Status)
      expect(data.severity).toBe(expectedSeverity)
      expect(data.code).toBe(0)
      expect(data.message).toBe(expectedMessage)
      return await Promise.resolve()
    }

    platform.addEventListener(PlatformStatus, listener)
    platform.setPlatformStatus(status)
    expect(listenerCalled).toBeTruthy()

    // remove listener to avoid calls from other tests
    platform.removeEventListener(PlatformStatus, listener)
  }

  it('should set string platform status', () => {
    testSetPlatformStatus('custom string', Severity.INFO, 'custom string')
  })

  it('should set error platform status', () => {
    testSetPlatformStatus(new Error('baga'), Severity.ERROR, 'baga')
  })

  it('should set custom platform status', () => {
    testSetPlatformStatus(new Status(Severity.OK, 0, 'custom message'), Severity.OK, 'custom message')
  })

  it('should set unknown platform status', () => {
    testSetPlatformStatus({ x: 'y' }, Severity.WARNING, 'Unknown status: [object Object]')
  })
})
