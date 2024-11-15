import https from 'https'
import { Readable } from 'stream'

export default class GithubLib {
  public static async getBranchHead(remoteurl, branch) {
    const remote = new URL(remoteurl)
    remote.pathname = '/info/refs?service=git-upload-pack'
  }

  private static getReaderFromHTTP(url: URL): Promise<Readable> {
    return new Promise((resolve, reject) => {
      https.get(url, (res) => {
        if (res.statusCode !== 200) {
          reject(new Error(`Request Failed. Status Code: ${res.statusCode}`))
          res.resume() // Consume response data to free up memory
          return
        }

        const reader = new Readable({
          read() {
            res.on('data', (chunk) => {
              this.push(chunk) // Push chunks of data to the reader
            })

            res.on('end', () => {
              this.push(null) // Signal the end of the stream
            })
          }
        })

        resolve(reader)
      })
    })
  }

  private static parsePktLines(reader: Readable)  {
    while (1) {
      const lenraw = reader.read(4) // Read the length of the pkt-line
      // Convert the length to a number
      const len = parseInt(lenraw.toString('utf8'), 16)
    }
  }
}