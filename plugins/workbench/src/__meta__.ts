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

import { Platform } from '@anticrm/platform'
import workbench from '.'
import { routeMeta } from '@anticrm/platform-ui'

export default (platform: Platform): void => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const spritesUrl: string = require('../assets/icons.svg')
  platform.loadMetadata(workbench.icon, {
    DefaultPerspective: `${spritesUrl}#perspective`,
    Add: `${spritesUrl}#add`,
    Resize: `${spritesUrl}#resize`,
    Close: `${spritesUrl}#close`,
    Finder: `${spritesUrl}#finder`,
    Lock: `${spritesUrl}#lock`,
    Sharp: `${spritesUrl}#sharp`,
    Burger: `${spritesUrl}#burger`,
    ArrowDown: `${spritesUrl}#arrowDown`,
    ArrowRight: `${spritesUrl}#arrowRight`
  })

  platform.setMetadata(routeMeta('workbench'), { route: 'workbench', component: workbench.component.Workbench })
}
