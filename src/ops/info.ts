import * as path from 'path'
import * as remoteGitTags from 'remote-git-tags'
import chalk from 'chalk'

import {
    readJSON,
    getGitFolder,
    parseRemoteLS,
    exec,
    parseToArray
} from '../helpers'

import config from '../config'

export const info = async function(CWD) {
    let file: { repository: string; tag: string } = await readJSON(
        path.join(CWD, config.FILE)
    )

    let project = getGitFolder(file.repository)

    console.log(``)
    console.log(` Name: ${chalk.cyan(project)}`)
    console.log(` Url: ${chalk.cyan(file.repository)}`)
    console.log(` Tag: ${chalk.cyan(file.tag)}`)
    console.log(``)

    console.log(`Getting tags of the repository...`)

    let result = await exec(
        { cwd: null, verbose: true },
        'git',
        'ls-remote -t',
        file.repository
    )
    let parsed = parseToArray(result)

    let parsedResult = parseRemoteLS(parsed)

    console.log(``)

    if (parsedResult.length === 0) {
        console.log(
            `${chalk.yellow('Warn')}: Any ref found in repository ${
                file.repository
            }`
        )
        process.exit(1)
    } else {
        console.log('Tags found: \n')
    }

    let max = 0
    parsedResult
        .map((value, i) => {
            if (value.ref.length > 0) {
                max = value.ref.length
            }
            return value
        })
        .forEach((value, i) => {
            let spaces = []
            if (max - value.ref.length > 0) {
                spaces = Array.apply(
                    ' ',
                    Array(max - value.ref.length + 1)
                ).join(' ')
            }
            console.log(`* [${chalk.green(value.ref)}]${spaces} ${value.hash}`)
        })

    console.log(``)
    console.log(`For update run 'gitseed upgrade'`)
    console.log(``)
}
