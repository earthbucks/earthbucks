import ScriptChunk from './script-chunk'

export default class Script {
  chunks: ScriptChunk[] = []

  constructor(chunks: ScriptChunk[] = []) {
    this.chunks = chunks
  }

  static fromString(str: string): Script {
    const chunks = str.split(' ').map(ScriptChunk.fromString)
    return new Script(chunks)
  }

  toString(): string {
    return this.chunks.map((chunk) => chunk.toString()).join(' ')
  }

  toUint8Array(): Uint8Array {
    const bufArray = this.chunks.map((chunk) => chunk.toUint8Array())
    const buf = Buffer.concat(bufArray)
    return new Uint8Array(buf)
  }

  fromUint8Array(arr: Uint8Array): this {
    let offset = 0
    while (offset < arr.length) {
      const chunk = new ScriptChunk().fromUint8Array(arr.slice(offset))
      this.chunks.push(chunk)
      offset += chunk.toUint8Array().length
    }
    return this
  }

  static fromUint8Array(arr: Uint8Array): Script {
    return new Script().fromUint8Array(arr)
  }
}
