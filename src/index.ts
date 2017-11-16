import * as updateNotifier from 'update-notifier'

import { infoCmd, upgradeCmd, initCmd, tagCmd, tagsCmd } from './cmds'
import { packageJson, createCLI } from './helpers'

updateNotifier({ pkg: packageJson }).notify()

createCLI(process.cwd())
    .define(
        `seedling`,
        'Manage project seeds',
        packageJson.version
    )
    .addCmd(infoCmd)
    .addCmd(initCmd)
    .addCmd(upgradeCmd)
    .addCmd(tagsCmd)
    .addCmd(tagCmd)
    .start()