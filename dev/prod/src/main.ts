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

import platform from '@anticrm/boot/src/platform'

import core from '@anticrm/platform-core'
import ui from '@anticrm/platform-ui'
import login, { currentAccount } from '@anticrm/login'

import ErrorPage from './components/ErrorPage.svelte'

const accountsUrl = process.env.APP_ACCOUNTS_URL
const host = process.env.APP_WSHOST
const port = process.env.APP_WSPORT

platform.setMetadata(login.metadata.AccountsUrl, accountsUrl)
platform.setMetadata(core.metadata.WSHost, host)
platform.setMetadata(core.metadata.WSPort, port)

const loginInfo = currentAccount()
if (loginInfo !== null) {
  platform.setMetadata(core.metadata.WhoAmI, loginInfo.email)
  platform.setMetadata(core.metadata.Token, loginInfo.token)
}

async function boot (): Promise<void> {
  const uiService = await platform.getPlugin(ui.id)
  uiService.createApp(document.body)
}

boot().catch(err => { // eslint-disable-line
  new ErrorPage({ target: document.body, props: { error: err.message } }) // eslint-disable-line no-new
})
