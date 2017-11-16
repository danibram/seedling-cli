import * as shell from 'shelljs'
import { output, err } from './'
import chalk from 'chalk'

export const exec = (
    { cwd, verbose = false },
    ...args: string[]
): Promise<string> =>
    new Promise((resolve, reject) => {
        let cmd = `${args.join(' ')}`

        verbose && output(chalk.gray(`$ ${cmd}`))

        let child =
            cwd || cwd !== '.'
                ? shell.cd(cwd).exec(cmd, { async: true, silent: true })
                : shell.exec(cmd, { async: true, silent: true })
        let buffer = []
        child.stderr.on('data', function(chunk) {
            buffer.push(chunk.toString())
        })
        child.stdout.on('data', function(chunk) {
            buffer.push(chunk.toString())
        })
        child.on('close', function(code) {
            code
                ? reject(buffer.join('') || `Process failed: ${code}`)
                : resolve(buffer.join(''))
        })
    })

export const parseToArray = (str: string): string[] =>
    str
        .split('\n')
        .filter(el => el !== '')
        .map(el => el.trim())

export const sp = (
    cwd: string | null = null,
    raw: boolean,
    exe: string,
    ...args: string[]
): Promise<string[]> =>
    new Promise((resolve, reject) => {
        let cmd = args.length > 0 ? `${exe} ${args.join(' ')}` : `${exe}`

        output(`$ ${cmd}`)

        let child =
            cwd || cwd !== '.'
                ? shell.cd(cwd).exec(cmd, { async: true, silent: true })
                : shell.exec(cmd, { async: true, silent: true })

        let buffer = []
        child.stderr.on('data', function(chunk) {
            buffer.push(chunk.toString())
        })
        child.stdout.on('data', function(chunk) {
            buffer.push(chunk.toString())
        })
        child.on('close', function(code) {
            buffer = raw
                ? buffer
                : buffer
                      .join('')
                      .split('\n')
                      .filter(el => el !== '')
                      .map(el => el.trim())

            if (code) {
                reject(buffer || `Process failed: ${code}`)
            } else {
                resolve(buffer)
            }
        })
    })

export const spawn = async (
    cwd: string | null = null,
    exe: string,
    ...args: string[]
): Promise<string[]> =>
    await sp(cwd, false, exe, ...args).then(
        res => res,
        err => {
            throw err
        }
    )
