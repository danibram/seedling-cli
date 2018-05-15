import * as shell from 'shelljs'
import * as path from 'path'
import * as os from 'os'
import * as remoteGitTags from 'remote-git-tags'
import chalk from 'chalk'
import * as inquirer from 'inquirer'
import * as shortid from 'shortid'
import * as fs from 'fs'

import {
    readJSON,
    writeJSON,
    getGitFolder,
    exec,
    spawn,
    parseRemoteLS,
    gitCheckout,
    writeFile,
    warn,
    seedrcType
} from '../helpers'

import config from '../config'

export const upgrade = async function(CWD) {
    let file: seedrcType = await readJSON(path.join(CWD, config.FILE))
    let project = getGitFolder(file.repository)
    let pathTemp = path.join(os.tmpdir(), `${project}-${shortid.generate()}`)

    await spawn(null, 'git', 'clone', file.repository, pathTemp)

    let seedfile: seedrcType = await readJSON(path.join(pathTemp, config.FILE))

    console.log(`Project:`)
    console.log(``)
    console.log(` Name: ${chalk.cyan(project)}`)
    console.log(` Url: ${chalk.cyan(file.repository)}`)
    console.log(` Tag: ${chalk.cyan(file.tag)}`)
    console.log(
        ` Type: ${
            file.type
                ? chalk.cyan(file.type)
                : seedfile.type
                    ? seedfile.type
                    : ''
        }`
    )
    console.log(
        ` PackagesJson: ${
            file.packagesJson
                ? chalk.cyan(file.packagesJson.join(','))
                : seedfile.packagesJson
                    ? seedfile.packagesJson
                    : ''
        }`
    )
    console.log(``)

    console.log(`Getting tags of the repository...`)

    let tags = await spawn(pathTemp, 'git', 'show-ref --tags')

    if (tags.length === 0 || !tags) {
        throw 'Any tag found on this monorepo'
    }

    let answers = await inquirer.prompt([
        {
            type: 'list',
            name: 'tag',
            message: 'What version you want to go?',
            paginated: true,
            choices: tags
        },
        {
            type: 'confirm',
            name: 'confirm',
            message: `Are you sure?`
        }
    ])

    if (!answers.confirm) {
        console.log('Okei!exiting...')
    }

    let [ref, rawTag] = answers.tag.split(' ')

    let [tag1, tag2] = rawTag.split('refs/tags/')

    let tagSelected = tag2 ? tag2 : tag1

    await gitCheckout(tagSelected, pathTemp)

    console.log(`Calculating diff `)
    const diff = await exec(
        { cwd: pathTemp },
        'git',
        'diff',
        `"${tagSelected}"`,
        `"${file.tag}"`,
        `-- . ":(exclude)*package-lock.json" ":(exclude)*package.json"`
    )

    let folderArray = file.folder.split('/')
    let gitPath = path.resolve(CWD, ...folderArray.map(() => '..'))

    if (diff.trim() === '') {
        console.log('No diff output')
    } else {
        console.log(`Applying diff on current dir`)
        let commands = [
            'git',
            'apply',
            '--whitespace=fix',
            '--reject',
            path.join(gitPath, 'patch.diff')
        ].filter(el => el !== '')

        console.log(`Saving diff on '${path.join(gitPath, 'patch.diff')}'`)
        await writeFile(path.join(gitPath, 'patch.diff'), diff)

        console.log(`Applying diff on '${path.join(CWD)}'`)
        try {
            let output = await exec({ cwd: CWD, verbose: true }, ...commands)
            await writeFile(path.join(CWD, 'seed.log'), output)
            shell.rm(path.join(gitPath, 'patch.diff'))
        } catch (err) {
            warn(
                'There are ouputs from git applying, output in the log "seed.log"'
            )
            warn(`Check diff on '${path.join(gitPath, 'patch.diff')}'`)
        }
    }

    //Merge dependencies
    await Promise.all(
        seedfile.packagesJson.map(async relativePath => {
            try {
                const [packageJsonSeed, packageJson] = await Promise.all([
                    readJSON(path.join(pathTemp, relativePath)),
                    readJSON(path.join(CWD, relativePath))
                ])

                const newDeps = Object.assign(
                    {},
                    packageJson.dependencies,
                    packageJsonSeed.dependencies
                )

                let devDependencies =
                    packageJson.devDependencies &&
                    packageJsonSeed.devDependencies
                        ? Object.assign(
                              {},
                              packageJson.devDependencies,
                              packageJsonSeed.devDependencies
                          )
                        : {}

                const newPackage = {
                    ...packageJson,
                    dependencies: newDeps,
                    ...(packageJson.devDependencies &&
                    packageJsonSeed.devDependencies
                        ? { devDependencies }
                        : {})
                }

                await writeJSON(path.join(CWD, relativePath), newPackage)
            } catch (err) {
                warn('Error reading packages.json')
                warn(err)
            }
        })
    )

    console.log(`Updating .seedrc`)
    await writeJSON(
        path.join(CWD, config.FILE),
        Object.assign({}, file, {
            type: seedfile.type,
            packagesJson: seedfile.packagesJson,
            tag: tagSelected
        })
    )
}
