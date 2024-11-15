import { Readable } from 'stream'
import { escapeRegex, readFromStream } from './utils'
import path from 'path'
import axios from 'axios'
import { Exception } from '@adonisjs/core/build/standalone'

export default class GithubLib {
  public static async getRefHeadCommit(remoteurl, ref): Promise<string> {
    const remote = new URL(remoteurl)
    remote.pathname = path.join(remote.pathname, '/info/refs')
    remote.searchParams.set('service', 'git-upload-pack')

    const reader = await this.getReaderFromHTTP(remote)

    const regref = escapeRegex(ref)
    const lines = await this.parsePktLines(reader, new RegExp(`^([0-9A-Za-z]+) refs\\/${regref}\n`))
    if (lines.length < 2 || !lines[1]) {
      throw new Exception("Cannot find this branch")
    }

    return lines[1]
  }

  private static async getReaderFromHTTP(url: URL): Promise<Readable> {
    const response = await axios({
      method: 'get',
      url: url.toString(),
      responseType: 'stream', // Axios will return the response body as a stream.
    });

    return response.data
  }

  private static async parsePktLines(reader: Readable, pattern?: RegExp): Promise<(string | null)[]> {
    const lines = new Array<string | null>()

    while (reader.readable) {
      const lenraw = await readFromStream(reader, 4) // Read the length of the pkt-line
      console.log('lenraw', lenraw)
      if (!lenraw) continue

      const len = parseInt(lenraw.toString('ascii'), 16) // Convert the length to a number
      console.log('len', len)

      if (len < 4) {
        lines.push(null) // Push null for flush-pkt
        continue
      }

      const lineraw = await readFromStream(reader, len - 4) // Read the pkt-line
      console.log('lineraw', lineraw)
      if (!lineraw) continue

      const line = lineraw.toString('ascii')
      console.log('line', line)

      if (pattern) {
        const match = pattern.exec(line)
        if (match) return match
      }

      lines.push(line)
    }

    return lines
  }

}
