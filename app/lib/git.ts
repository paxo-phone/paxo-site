import { Readable } from 'stream'
import { escapeRegex, readFromStream } from './utils'
import path from 'path'
import axios from 'axios'
import { Exception } from '@adonisjs/core/build/standalone'

export default class GitLib {
  public static async getRefHeadCommit(remoteurl, ref): Promise<string> {
    const remote = new URL(remoteurl)
    remote.pathname = path.join(remote.pathname, '/info/refs')
    remote.searchParams.set('service', 'git-upload-pack')

    const reader = await this.getReaderFromHTTP(remote)

    const regref = escapeRegex(ref)
    const lines = await this.parsePktLines(reader, new RegExp(`^([0-9A-Fa-f]+) refs\\/${regref}\n`))
    if (lines.length < 2 || !lines[1]) {
      throw new Exception("Cannot find this branch")
    }

    return lines[1]
  }

  public static async safeListBranches(remoteurl): Promise<string[]> {
    try {
      return await this.listBranches(remoteurl)
    } catch (e) {
      return []
    }
  }

  public static async listBranches(remoteurl): Promise<string[]> {
    const remote = new URL(remoteurl)
    remote.pathname = path.join(remote.pathname, '/info/refs')
    remote.searchParams.set('service', 'git-upload-pack')

    const reader = await this.getReaderFromHTTP(remote)

    const lines = await this.parsePktLines(reader, /^[0-9A-Fa-f]+ refs\/heads\/([0-9A-Za-z#_.-]+)\n/, true)

    let i: number
    while ((i = lines.indexOf(null)) !== -1) {
      lines.splice(i, 1)
    }

    return lines as string[]
  }

  private static async getReaderFromHTTP(url: URL): Promise<Readable> {
    const response = await axios({
      method: 'get',
      url: url.toString(),
      responseType: 'stream', // Axios will return the response body as a stream.
    });

    return response.data
  }

  private static async parsePktLines(reader: Readable, pattern?: RegExp, globalmatch = false): Promise<(string | null)[]> {
    const lines = new Array<string | null>()

    let match

    while (reader.readable) {
      const lenraw = await readFromStream(reader, 4) // Read the length of the pkt-line
      if (!lenraw) continue

      const len = parseInt(lenraw.toString('ascii'), 16) // Convert the length to a number

      if (len < 4) {
        lines.push(null) // Push null for flush-pkt
        continue
      }

      const lineraw = await readFromStream(reader, len - 4) // Read the pkt-line
      if (!lineraw) continue

      const line = lineraw.toString('ascii')

      if (pattern && (match = pattern.exec(line)) !== null) {
        if (globalmatch) lines.push(match[match.length - 1])
        else return match
      }

      if (!globalmatch) lines.push(line)
    }

    return lines
  }

}
