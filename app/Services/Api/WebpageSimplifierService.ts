import * as himalaya from "himalaya"
import {Element, TreeElement} from "App/Services/Api/WebpageSimplifierTypes"

export class WebpageSimplifierService {
  private unusedTagTypes: string[] = [
    'link',
    'script',
    'style'
  ]

  private unusedAttrs: string[] = [
    'class'
  ]

  private parse(html: string): Element[] {
    function removeNewlines(node) {
      if (node.type === 'text' && /^\s*$/.test(node.content)) {
        return null // Remove the node
      }

      if (node.children) {
        node.children = node.children.map(removeNewlines).filter(Boolean);
      }

      return node
    }

    return himalaya.parse(html).map(removeNewlines).filter(Boolean)
  }

  private doSimplify(html: Element[], lastElement: Element = {type: 'element', tagName: 'root', attributes: []}): TreeElement | any[] | undefined {
    let newTree: Array<TreeElement | any[] | undefined> = []

    for(const element of html) {
      const tagName = element.tagName ? element.tagName : ''
      if(element.children !== undefined && !(this.unusedTagTypes.includes(tagName))) {
        newTree.push(this.doSimplify(element.children, element))
      } else if(element.type === 'text') {
        if(lastElement.attributes) {
          for(const attr of lastElement.attributes) {
            if(this.unusedAttrs.includes(attr.key)) {
              const index = lastElement.attributes.indexOf(attr);
              if (index !== -1) {
                lastElement.attributes.splice(index, 1);
              }
            }
          }
        }
        const newTreeElement: TreeElement = {parent: lastElement, content: element.content}
        newTree.push(newTreeElement)
      }
    }
    if(newTree.length !== 0) return newTree.length === 1 ? newTree[0] : newTree
  }

  private generateHtml(tree: any[] | undefined): string {
    if(tree === undefined) return ''

    let html: string = ''

    for(const element of tree) {
      if(element) {
        if(Array.isArray(element)) {
          html += this.generateHtml(element)
        } else {
          let attrs = ''
          if(element.parent.attributes) {
            for(const attr of element.parent.attributes) {
              attrs += ` ${attr.key}="${attr.value}"`
            }
            html += `<${element.parent.tagName}${attrs}>${element.content}</${element.parent.tagName}>`
          }
        }
      }
    }
    return html
  }

  public simplify(responseHtml: string): string {
    const beforeHtml = this.parse(responseHtml)
    const afterHtml = this.doSimplify(beforeHtml)

    return this.generateHtml([afterHtml])
  }
}
