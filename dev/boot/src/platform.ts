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

import { createPlatform } from '@anticrm/platform'

import ui from '@anticrm/platform-ui'
import core from '@anticrm/platform-core'
import i18n from '@anticrm/platform-i18n'
import activity from '@anticrm/activity'
import fsm from '@anticrm/fsm'
import activityMeta from '@anticrm/activity/src/__meta__'
import login from '@anticrm/login'
import workbench from '@anticrm/workbench'
import presentation from '@anticrm/presentation'
import task from '@anticrm/task'
import contact from '@anticrm/contact'
import chunter from '@anticrm/chunter'
import guidebook from '@anticrm/guidebook'
import datagen from '@anticrm/data-generator'
import recruiting from '@anticrm/recruiting'
import personExtras from '@anticrm/person-extras'
import calendar from '@anticrm/calendar'
import uiMeta from '@anticrm/platform-ui/src/__meta__/meta'
import workbenchMeta from '@anticrm/workbench/src/__meta__'
import chunterMeta from '@anticrm/chunter/src/__meta__'
import recruitingMeta from '@anticrm/recruiting/src/__meta__'
import taskMeta from '@anticrm/task/src/__meta__'
import presentationMeta from '@anticrm/presentation/src/__meta__'
import loginMeta from '@anticrm/login/src/__meta__'
import dataGenMeta from '@anticrm/data-generator/src/__meta__'

const platform = createPlatform()

platform.setMetadata(ui.metadata.LoginApplication, 'login')
platform.setMetadata(ui.metadata.DefaultApplication, 'workbench')

platform.addLocation(ui, () => import(/* webpackChunkName: "platform-ui" */ '@anticrm/platform-ui/src/plugin')) // eslint-disable-line
platform.addLocation(core, () => import(/* webpackChunkName: "platform-core" */ '@anticrm/platform-core/src/plugin')) // eslint-disable-line
platform.addLocation(i18n, () => import(/* webpackChunkName: "platform-i18n" */ '@anticrm/platform-i18n/src/plugin')) // eslint-disable-line
platform.addLocation(login, () => import(/* webpackChunkName: "login" */ '@anticrm/login/src/plugin')) // eslint-disable-line
platform.addLocation(presentation, () => import(/* webpackChunkName: "presentation" */ '@anticrm/presentation/src/plugin')) // eslint-disable-line
platform.addLocation(workbench, () => import(/* webpackChunkName: "workbench" */ '@anticrm/workbench/src/plugin')) // eslint-disable-line
platform.addLocation(task, () => import(/* webpackChunkName: "task" */ '@anticrm/task/src/plugin')) // eslint-disable-line
platform.addLocation(task, () => import(/* webpackChunkName: "task" */ '@anticrm/task/src/plugin')) // eslint-disable-line
platform.addLocation(contact, () => import(/* webpackChunkName: "contact" */ '@anticrm/contact/src/plugin')) // eslint-disable-line
platform.addLocation(chunter, () => import(/* webpackChunkName: "chunter" */ '@anticrm/chunter/src/plugin')) // eslint-disable-line
platform.addLocation(guidebook, () => import(/* webpackChunkName: "guidebook" */ '@anticrm/guidebook/src/plugin')) // eslint-disable-line
platform.addLocation(recruiting, () => import(/* webpackChunkName: "recruiting" */ '@anticrm/recruiting/src/plugin')) // eslint-disable-line
platform.addLocation(personExtras, () => import(/* webpackChunkName: "person-extras" */ '@anticrm/person-extras/src/plugin')) // eslint-disable-line
platform.addLocation(calendar, () => import(/* webpackChunkName: "calendar" */ '@anticrm/calendar/src/plugin')) // eslint-disable-line
platform.addLocation(activity, () => import(/* webpackChunkName: "activity" */ '@anticrm/activity/src/plugin')) // eslint-disable-line
platform.addLocation(fsm, () => import(/* webpackChunkName: "fsm" */ '@anticrm/fsm/src/plugin')) // eslint-disable-line

platform.addLocation(datagen, () => import(/* webpackChunkName: "datagen" */ '@anticrm/data-generator/src/plugin')) // eslint-disable-line

uiMeta(platform)
workbenchMeta(platform)
activityMeta(platform)
chunterMeta(platform)
// recruitmentMeta(platform)
recruitingMeta(platform)
taskMeta(platform)
presentationMeta(platform)
loginMeta(platform)
// contactMeta(platform)
dataGenMeta(platform)

export default platform
