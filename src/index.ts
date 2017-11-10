import * as updateNotifier from 'update-notifier'

import { infoCmd, upgradeCmd, initCmd } from './cmds'
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
    .start()