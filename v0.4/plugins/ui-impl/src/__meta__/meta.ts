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

import { Platform } from '@anticrm/plugin'
import ui from '@anticrm/plugin-ui'

export default (platform: Platform): void => {
  const spritesUrl = require('../../assets/icons.svg') as string // eslint-disable-line @typescript-eslint/no-var-requires
  platform.loadMetadata(ui.icon, {
    Default: `${spritesUrl}'#error`,
    Error: `${spritesUrl}#error`,
    Network: `${spritesUrl}#network`,
    Search: `${spritesUrl}#search`,
    Add: `${spritesUrl}#add`,
    ArrowDown: `${spritesUrl}#arrowDown`,
    Message: `${spritesUrl}#message`,
    Phone: `${spritesUrl}#phone`,
    Mail: `${spritesUrl}#mail`,
    More: `${spritesUrl}#more`
  })
}