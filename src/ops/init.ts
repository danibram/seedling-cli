import * as shell from 'shelljs'
import * as path from 'path'
import * as os from 'os'
import * as remoteGitTags from 'remote-git-tags'
import chalk from 'chalk'
import * as inquirer from 'inquirer'
import * as shortid from 'shortid'

import {
    readJSON,
    writeJSON,
    getGitFolder,
    exec,
    spawn,
    parseRemoteLS,
    gitCheckout,
    writeFile,
    warn
} from '../helpers'

import config from '../config'

export const init = async function(CWD, repository, root?, folder?, tag?) {
    console.log(`Init Project:`)
    console.log(``)
    console.log(` Url: ${chalk.cyan(repository)}`)
    console.log(` Tag: ${tag ? chalk.cyan(tag) : 'Any tag specified'}`)
    console.log(
        ` Folder: ${
            folder
                ? chalk.cyan(folder)
                : 'Any folder specified so root will be used'
        }`
    )
    console.log(``)

    let projectFolder = root ? path.join(CWD, root) : CWD

    let file = {
        repository,
        tag,
        folder
    }

    if (root) {
        shell.mkdir(root)
    }

    await spawn(null, 'git', 'clone', repository, projectFolder)

    let tags = await spawn(projectFolder, 'git', 'show-ref --tags')

    if (tags.length === 0 || !tags) {
        throw 'Any tag found on this repo'
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
        console.log('Okey!Exiting...')
    }

    await gitCheckout(answers.tag.split(' ')[0], projectFolder)

    shell.rm('-rf', path.join(projectFolder, '.git'))

    /*
    let file: {repository:string, tag:string, folder:string} = await readJSON(path.join(CWD, config.FILE))
    let project = getGitFolder(file.repository)
    let pathTemp = path.join(os.tmpdir(), `${project}-${shortid.generate()}`)

    console.log(`Project:`)
    console.log(``)
    console.log(` Name: ${chalk.cyan(project)}`)
    console.log(` Url: ${chalk.cyan(file.repository)}`)
    console.log(` Tag: ${chalk.cyan(file.tag)}`)
    console.log(``)

    console.log(`Getting tags of the repository...`)

    await spawn(null, 'git', 'clone', file.repository, pathTemp)

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

    await gitCheckout(answers.tag.split(' ')[0], pathTemp)

    console.log('Calculating diff')
    let diff = await exec({ cwd: pathTemp }, 'git', 'diff', file.tag, answers.tag.split(' ')[1])

    let folderArray = file.folder.split('/')
    let gitPath = path.resolve(CWD, ...folderArray.map(()=>'..'))

    console.log(`Applying diff on current dir`)
    let commands = [
        'apply',
        '--whitespace=fix',
        `${
            folderArray.length>0
                ? `--directory=${path.join(...folderArray)}`
                : ''
        }`,
        '--reject',
        path.join(gitPath, 'patch.diff')
    ].filter(el=> el!=='')

    console.log(`Saving diff on '${path.join(gitPath, 'patch.diff')}'`)
    await writeFile(path.join(gitPath, 'patch.diff'), diff)

    console.log(`Applying diff on '${path.join(CWD)}'`)

    try{
        await spawn(gitPath, 'git', ...commands)
    } catch(err){
        warn('There are ouputs from git applying, output in the log "seed.log"')
        await writeFile(path.join(CWD, 'seed.log'), err.join('\n'))
    }

    await writeJSON(path.join(CWD, config.FILE), Object.assign({},file,{
        tag: file.tag
    }))

    shell.rm(path.join(gitPath, 'patch.diff'))
    */
}
