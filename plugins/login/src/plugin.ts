//
// Copyright © 2020, 2021 Anticrm Platform Contributors.
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

import { Platform, PlatformStatus, Severity, Status } from '@anticrm/platform'
import platformIds from '@anticrm/platform-core'
import { Request, Response, serialize, toStatus } from '@anticrm/rpc'

import uiPlugin, { UIService } from '@anticrm/platform-ui'

import login, { ACCOUNT_KEY, LoginInfo, LoginService } from '.'

import LoginForm from './components/LoginForm.svelte'
import SettingForm from './components/SettingForm.svelte'
import MainLoginForm from './components/MainLoginForm.svelte'
import { PlatformError, PlatformStatusCodes } from '@anticrm/foundation'
import FingerprintJS from '@fingerprintjs/fingerprintjs'

/*!
 * Anticrm Platform™ Login Plugin
 * © 2020 Anticrm Platform Contributors. All Rights Reserved.
 * Licensed under the Eclipse Public License, Version 2.0
 */
export default async (platform: Platform, deps: { ui: UIService }): Promise<LoginService> => {
  const uiService = deps.ui

  const accountsUrl = platform.getMetadata(login.metadata.AccountsUrl)
  if (accountsUrl === undefined) {
    throw new PlatformError(new Status(Severity.ERROR, 0, 'no accounts server metadata provided.'))
  }
  platform.setResource(login.component.LoginForm, LoginForm)
  platform.setResource(login.component.MainLoginForm, MainLoginForm)
  platform.setResource(login.component.SettingForm, SettingForm)

  // platform.setResource(login.component.SignupForm, SignupForm)

  function setLoginInfo (loginInfo: LoginInfo): void {
    localStorage.setItem(ACCOUNT_KEY, JSON.stringify(loginInfo))

    platform.setMetadata(platformIds.metadata.WhoAmI, loginInfo.email)
    platform.setMetadata(platformIds.metadata.Token, loginInfo.token)
  }

  function clearLoginInfo (): void {
    localStorage.removeItem(ACCOUNT_KEY)

    platform.setMetadata(platformIds.metadata.WhoAmI, undefined)
    platform.setMetadata(platformIds.metadata.Token, undefined)
  }

  async function getLoginInfo (): Promise<LoginInfo | undefined> {
    const account = localStorage.getItem(ACCOUNT_KEY)
    if (account === null) {
      return undefined
    }
    const loginInfo = JSON.parse(account) as LoginInfo

    const token = platform.getMetadata(platformIds.metadata.Token)
    if (token === undefined) {
      return undefined
    }
    // Do some operation to check if token is expired or not.
    return loginInfo
  }

  async function navigateApp (): Promise<void> {
    const defaultApp = platform.getMetadata(uiPlugin.metadata.DefaultApplication)
    if (defaultApp !== undefined) {
      uiService.navigateJoin([defaultApp], undefined, undefined)
    }
  }

  async function navigateLoginForm (): Promise<void> {
    const loginApp = platform.getMetadata(uiPlugin.metadata.LoginApplication)
    if (loginApp !== undefined) {
      uiService.navigateJoin([loginApp], undefined, undefined)
    }
  }

  async function saveSetting (password: string, newPassword: string, secondFactorEnabled: boolean, clientSecret: string, secondFactorCode: string): Promise<Status> {
    const loginInfo = await getLoginInfo()
    if (loginInfo === undefined) {
      return new Status(Severity.ERROR, 0, 'Необходимо авторизоваться')
    }
    const request: Request<[string, string, string, boolean, string, string]> = {
      method: 'updateAccount',
      params: [loginInfo.email, password, newPassword, secondFactorEnabled, clientSecret, secondFactorCode]
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const response = await fetch(accountsUrl!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json;charset=utf-8'
        },
        body: serialize(request)
      })
      const result = (await response.json()) as Response<any>
      if (result.error?.message !== undefined) {
        return toStatus(result)
      }
      if (result.result !== undefined) {
        setLoginInfo(result.result)
      }
      return new Status(Severity.OK, 0, '')
    } catch (err) {
      return new Status(Severity.ERROR, 0, 'Не могу соедениться с сервером.')
    }
  }

  async function doLogin (username: string, password: string, workspace: string, secondFactorCode: string): Promise<Status> {
    const fp = await FingerprintJS.load()
    const result = await fp.get()
    const clientId = result.visitorId

    const request: Request<[string, string, string, string, string]> = {
      method: 'login',
      params: [username, password, workspace, clientId, secondFactorCode]
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const response = await fetch(accountsUrl!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json;charset=utf-8'
        },
        body: serialize(request)
      })
      const result = (await response.json()) as Response<any>
      if (result.error?.message !== undefined) {
        return toStatus(result)
      }
      if (result.result !== undefined) {
        setLoginInfo(result.result)

        platform.broadcastEvent(PlatformStatus, new Status(Severity.OK, PlatformStatusCodes.AUTHENTICATON_OK, ''))
        console.log('do navigate')
        await navigateApp()
      }
      return new Status(Severity.OK, 0, '')
    } catch (err) {
      return new Status(Severity.ERROR, 0, 'Не могу соедениться с сервером.')
    }
  }

  async function doLogout (): Promise<void> {
    const token = platform.getMetadata(platformIds.metadata.Token)
    if (token !== undefined) {
      clearLoginInfo()
    }
  }

  return {
    doLogin,
    doLogout,
    getLoginInfo,
    navigateApp,
    navigateLoginForm,
    saveSetting
  }
}
