
export declare interface Attribute {
  key: string
  value: string
}

export declare interface Element {
  type: string & ('element' | 'text')
  tagName?: string
  attributes?: Attribute[]
  children?: Element[]
  content?: string
}

export declare interface TreeElement {
  parent: Element
  content: string | undefined
}
