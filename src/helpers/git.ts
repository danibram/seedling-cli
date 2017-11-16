import * as shell from 'shelljs'
import * as path from 'path'
import * as util from 'util'

import { spawn, output, exec } from './'

export const getGitFolder = (str: string): string => {
    let last = str.split('/').reverse()[0]
    let pattern = new RegExp(`\(.*?)\\.git`, 'i')
    let result = pattern.exec(last)

    if (!result || result[1] === '') {
        return last
        // throw `this is not a correct git repo url '${str}'`
    }

    return pattern.exec(last)[1]
}

export const parseRemoteLS = (arr: string[]): { hash: string; ref: string }[] =>
    arr.reduce((acc, val) => {
        let t = val.split('\t')
        if (t[1] !== 'HEAD' && t[1].indexOf('^{}') === -1) {
            acc.push({
                hash: t[0],
                ref: t[1]
            })
        }
        return acc
    }, [])

export const gitGetTag = (pathToDir?) => (...args) =>
    spawn(pathToDir, 'git tag', ...args)

export const getTags = async (pathToDir?) => {
    return await gitGetTag(pathToDir)()
}

export const removeRemoteTag = (tag, pathToDir?) =>
    spawn(pathToDir, 'git', 'push', '--delete', 'origin', tag)

export const removeLocalTag = (tag, pathToDir?) =>
    spawn(pathToDir, 'git', 'tag', '--delete', tag)

export const gitTag = (tag, pathToDir?) => spawn(pathToDir, 'git', 'tag', tag)

export const pushTag = (tag, pathToDir?) =>
    spawn(pathToDir, 'git', 'push', 'origin', tag)

export const gitPull = (pathToDir?) => spawn(pathToDir, 'git', 'pull')

export const gitClone = (url, destination, pathToDir?) =>
    spawn(pathToDir, 'git', 'clone', url, destination)

export const gitCheckout = (str, pathToDir?) =>
    spawn(pathToDir, 'git', 'checkout', str)
