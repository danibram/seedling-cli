import chalk from 'chalk'
import * as program from 'commander'
import * as shell from 'shelljs'
import * as fs from 'fs'

import config from '../config'
import { header } from '../helpers'

export class Cli {
    CWD: string
    P: typeof program
    opts: string[][]
    executed: boolean = false
    startTime: Date
    version: string
    name: string
    error: string | null = null

    constructor(CWD) {
        this.CWD = CWD
        this.P = program
        return this
    }

    header = cmd => `${chalk.green(this.name)} ${cmd} v${this.version}`

    define(name, description, version, ...options) {
        this.name = name
        this.version = version

        this.P.version(version).description(
            `${chalk.green.bold(name)} ${chalk.white.bold(`v${version}`)} ${
                description
            }`
        )

        options.forEach(opt => this.P.option(...opt.split('|')))
        return this
    }

    exec = () => {
        this.executed = true
    }

    _onStart(name) {
        this.startTime = new Date()
        console.log(this.header(name))
    }

    _onEnd(...err) {
        let now = new Date()
        let secs = ((now as any) - (this.startTime as any)) / 100

        let msg = ''
        if (err.length > 0) {
            msg = `Error ${chalk.red(err.join(' '))}`
            this.error = msg
        } else {
            msg = `Complete`
        }

        console.log(`${msg} ${chalk.bold(secs.toString())}s`)
    }

    addCmd({ name, params, description, action }) {
        this.P.command(`${name} ${params}`)
            .description(description)
            .action(async (...args) => {
                this.exec()
                this._onStart(name)

                try {
                    await action(this.CWD, ...args)
                    this._onEnd()
                    process.exit(0)
                } catch (err) {
                    this._onEnd(err)
                    process.exit(1)
                }
            })

        return this
    }

    start() {
        this.P.parse(process.argv)

        if (!this.executed) {
            this.P.outputHelp()
            process.exit(1)
        }
    }
}

export function createCLI(CWD): Cli {
    return new Cli(CWD)
}
