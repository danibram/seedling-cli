import * as path from 'path'
import * as remoteGitTags from 'remote-git-tags'
import chalk from 'chalk'
import semver from 'semver'

import {
    readJSON,
    getGitFolder,
    spawn,
    parseRemoteLS,
    gitGetTag,
    exec
} from '../helpers'

import config from '../config'

export const tags = async function(CWD) {
    let tags = await exec({ cwd: CWD, verbose: true }, 'git', 'tag')

    if (tags.length === 0 || !tags) {
        throw 'Any tag found on this monorepo'
    }

    console.log(`Tags found:`)

    tags
        .split('\n')
        .filter(el => el !== '')
        .map(el => el.trim())
        .sort((a,b)=> semver.compare(a,b))
        .forEach(tag => {
            console.log(`* [${chalk.green(tag)}]`)
        })
}
