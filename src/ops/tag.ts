import * as path from 'path'
import * as remoteGitTags from 'remote-git-tags'
import chalk from 'chalk'

import { exec } from '../helpers'

import config from '../config'

export const tag = async function(CWD, tag) {
    await exec({cwd: CWD, verbose: true}, 'git', 'tag', tag)
    await exec({cwd: CWD, verbose: true}, 'git', 'push', 'origin', tag)
}
