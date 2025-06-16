import { Readable } from 'stream'

export function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export async function readFromStream(stream: Readable, size: number): Promise<Buffer | null> {
  return new Promise((resolve, reject) => {
    const onReadable = () => {
      const chunk = stream.read(size);
      if (chunk !== null) {
        cleanup();
        resolve(chunk);
      }
    };

    const onEnd = () => {
      cleanup();
      resolve(null); // Stream has ended.
    };

    const onError = (error: Error) => {
      cleanup();
      reject(error); // Stream encountered an error.
    };

    const cleanup = () => {
      stream.removeListener('readable', onReadable);
      stream.removeListener('end', onEnd);
      stream.removeListener('error', onError);
    };

    // Attempt to read immediately; otherwise, wait for events.
    const chunk = stream.read(size);
    if (chunk !== null) {
      resolve(chunk);
    } else {
      stream.on('readable', onReadable);
      stream.on('end', onEnd);
      stream.on('error', onError);
    }
  });
}
