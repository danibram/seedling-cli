import { info, upgrade, init } from './ops'

export const infoCmd = {
    name: 'info',
    params: '',
    description: 'Check seed information and updates',
    action: info
}

export const upgradeCmd = {
    name: 'upgrade',
    params: '',
    description: 'Upgrade repository',
    action: upgrade
}

export const initCmd = {
    name: 'init',
    params: '<repository> [root] [folder] [tag]',
    description: 'Init a project pass your url, root if you want to create a folder, folder if you are putting this seed in non-root path, and tag if you know the tag, if not a prompt select will appear',
    action: init
}