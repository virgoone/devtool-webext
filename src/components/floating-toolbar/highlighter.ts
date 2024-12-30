// highlight-painter.ts
interface HighlightOptions {
  sentenceColor?: string
  sentenceDarkColor?: string
  sentenceRadius?: number
  wordColor?: string
  wordDarkColor?: string
  wordRadius?: number
}

interface HighlightSentenceOptions {
  text: string
  container: HTMLElement
  range: Range
}

class Highlighter {
  private sentenceColor: string
  private sentenceDarkColor: string
  private sentenceRadius: number
  private wordColor: string
  private wordDarkColor: string
  private wordRadius: number
  private text: string
  private isInitObserve: boolean
  private findTextNodeContainerMap: Map<HTMLElement, Record<string, number>>
  private findRangeTextNodesMap: Map<HTMLElement, Record<string, number>>
  private static registered: boolean = false
  private range: Range | undefined
  private textNodeContainer: HTMLElement | null
  private textNodeBlockContainer: HTMLElement | null
  private blockContainer: HTMLElement | null
  private sentenceOffset: { startIndex: number; endIndex: number } | undefined
  private wordOffset: { startIndex: number; endIndex: number } | undefined
  private sentencePos: number[] | null
  private wordPos: number[] | null
  private resizeOb: ResizeObserver | null

  constructor(options: HighlightOptions = {}) {
    this.sentenceColor = "rgba(122, 89, 255, 0.08)"
    this.sentenceDarkColor = "rgba(122, 89, 255, 0.16)"
    this.sentenceRadius = 6
    this.wordColor = "rgba(122, 89, 255, 0.16)"
    this.wordDarkColor = "rgba(122, 89, 255, 0.32)"
    this.wordRadius = 6
    this.text = ""
    this.isInitObserve = true
    this.findTextNodeContainerMap = new Map()
    this.findRangeTextNodesMap = new Map()

    // 初始化未赋值的属性
    this.textNodeContainer = null
    this.textNodeBlockContainer = null
    this.blockContainer = null
    this.sentenceOffset = undefined
    this.wordOffset = undefined
    this.sentencePos = null
    this.wordPos = null
    this.resizeOb = null

    if (!Highlighter.registered) {
      if ("paintWorklet" in CSS) {
        //@ts-ignore
        CSS.paintWorklet.addModule("https://dounione.s3.bitiful.net/static/highlight-painter.js?no-wait=on")
      }
      Highlighter.registered = true
    }

    Object.assign(this, options)

    this.calcInnerTextAndTextContentOffset = this.memoize(
      this.calcInnerTextAndTextContentOffset.bind(this),
      (r, n) => `${r}${n}`
    )
    this.indexOf = this.memoize(this.indexOf.bind(this), (r, n) => `${r}${n}`)
  }

  private memoize<T extends (...args: any[]) => any>(
    fn: T,
    keyFn: (...args: Parameters<T>) => string
  ): T {
    const cache = new Map<string, ReturnType<T>>()
    return ((...args: Parameters<T>) => {
      const key = keyFn(...args)
      if (cache.has(key)) {
        return cache.get(key)
      }
      const result = fn(...args)
      cache.set(key, result)
      return result
    }) as T
  }

  highlightSentence(options: HighlightSentenceOptions): void {
    this.unhighlight()
    this.text = options.text.trim()
    this.range = options.range
    this.blockContainer = this.findParentBlockElement(options.container)
    this.textNodeContainer = this.findTextNodeContainer(
      this.text,
      this.blockContainer
    )
    this.textNodeBlockContainer = this.findParentBlockElement(
      this.textNodeContainer
    )
    this.sentenceOffset = undefined
    this.wordOffset = undefined
    this.doHighlightSentence()
    this.setResizeObserver(this.textNodeBlockContainer)
  }

  highlightWord(startIndex: number, endIndex: number): void {
    this.wordOffset = { startIndex, endIndex }
    this.doHighlightWord()
  }

  private setResizeObserver(element: HTMLElement | null): void {
    if (!element) return
    this.isInitObserve = true
    if (!this.resizeOb) {
      this.resizeOb = new ResizeObserver(
        this.debounce(() => {
          if (this.isInitObserve) {
            this.isInitObserve = false
            return
          }
          this.doHighlightSentence()
          this.doHighlightWord()
        }, 50)
      )
    }
    this.resizeOb.disconnect()
    this.resizeOb.observe(element)
  }

  private doHighlightSentence(): void {
    this.sentencePos = this.calcPos(
      this.text,
      this.textNodeBlockContainer,
      this.textNodeContainer,
      undefined,
      this.range
    )
    if (this.sentencePos) {
      this.setContainerStyle(
        this.textNodeBlockContainer,
        this.textNodeContainer,
        this.sentencePos
      )
    }
  }

  private doHighlightWord(): void {
    if (this.wordOffset) {
      this.wordPos = this.calcPos(
        this.text,
        this.textNodeBlockContainer,
        this.textNodeContainer,
        this.wordOffset,
        this.range
      )
      if (this.wordPos && this.sentencePos) {
        this.setContainerStyle(
          this.textNodeBlockContainer,
          this.textNodeContainer,
          this.sentencePos,
          this.wordPos
        )
      }
    }
  }

  private findTextNodeContainer(
    text: string,
    container: HTMLElement | null
  ): HTMLElement {
    let result: HTMLElement | null = null
    const cleanText = (text: string, element: HTMLElement): string => {
      let count = this.findTextNodeContainerMap.get(element)?.[text] || 0
      for (let i = 0; i < count; i++) {
        text = text.replace(text, "")
      }
      return text
    }

    const checkElement = (element: HTMLElement): boolean => {
      if (
        cleanText(element.innerText, element).includes(text) ||
        cleanText(element.textContent || "", element).includes(text)
      ) {
        let countMap = this.findTextNodeContainerMap.get(element) || {}
        countMap[text] = (countMap[text] || 0) + 1
        this.findTextNodeContainerMap.set(element, countMap)
        return true
      }
      return false
    }

    const potentialContainers: HTMLElement[] = []
    const traverse = (element: HTMLElement): boolean => {
      if (
        element.innerText.includes(text) ||
        element.textContent?.includes(text)
      ) {
        let found = false
        for (let child of element.children) {
          if (
            child.nodeType === Node.ELEMENT_NODE &&
            child.nodeName !== "svg" &&
            traverse(child as HTMLElement)
          ) {
            found = true
          }
        }
        if (!found) {
          potentialContainers.push(element)
        }
        return true
      }
      return false
    }

    if (container) {
      traverse(container)
      for (let element of potentialContainers) {
        if (checkElement(element)) {
          result = element
          break
        }
      }
    }

    return result || container || document.body
  }

  private findParentBlockElement(element: Node | null): HTMLElement {
    if (
      element &&
      element.nodeType === Node.ELEMENT_NODE &&
      this.isBlockElement(element as HTMLElement) &&
      element.nodeName !== "A" &&
      element.nodeName !== "SPAN"
    ) {
      return element as HTMLElement
    }
    return this.findParentBlockElement(element?.parentNode || document.body)
  }

  private isBlockElement(element: HTMLElement): boolean {
    // 假设这个方法检查元素是否为块级元素
    // 这里需要根据实际需求实现
    return true
  }

  private calcPos(
    text: string,
    blockContainer: HTMLElement | null,
    textNodeContainer: HTMLElement | null,
    wordOffset: { startIndex: number; endIndex: number } | undefined,
    range: Range | undefined
  ): number[] | null {
    let start: { node: Text; offset: number } | undefined
    let end: { node: Text; offset: number } | undefined

    if (
      range &&
      range.startContainer === range.endContainer &&
      range.startContainer.nodeType === Node.TEXT_NODE
    ) {
      start = { node: range.startContainer as Text, offset: range.startOffset }
      end = { node: range.endContainer as Text, offset: range.endOffset }
      if (wordOffset) {
        end.offset = start.offset + wordOffset.endIndex
        start.offset = start.offset + wordOffset.startIndex
      }
    } else {
      const rangeNodes = this.findRangeTextNodes(
        text,
        textNodeContainer,
        wordOffset
      )
      if (!rangeNodes || rangeNodes.length !== 2) {
        return null
      }
      ;[start, end] = rangeNodes
    }

    if (!start || !end || !blockContainer) {
      return null
    }

    const highlightRange = new Range()
    highlightRange.setStart(start.node, start.offset)
    highlightRange.setEnd(end.node, end.offset)

    const blockRect = blockContainer.getBoundingClientRect()
    const highlightRects = highlightRange.getClientRects()
    const positions: number[] = []
    const textNodeStyle = getComputedStyle(textNodeContainer!)
    const lineHeight = parseInt(textNodeStyle.lineHeight, 10)

    ;[...highlightRects].forEach((rect) => {
      let x = rect.x - blockRect.x
      let y = rect.y - blockRect.y
      let width = rect.width
      let height = rect.height
      let offset = lineHeight - rect.height

      if (offset < 0) {
        height = lineHeight - 4
        y = y + (rect.height - height) / 2
      }

      if (x < 0) x = 0
      if (y < 0) y = 0
      if (x > 0) {
        x -= 3
        width += 6
      }
      if (y > 0 && offset > 4) {
        y -= 1
        height += 2
      }

      positions.push(x, y, width, height)
    })

    return positions
  }

  private getSentenceOffset(
    text: string,
    container: HTMLElement,
    fullText: string
  ): { startIndex: number; endIndex: number } {
    if (!this.sentenceOffset) {
      const cleanText = (text: string, element: HTMLElement): string => {
        let count = this.findRangeTextNodesMap.get(element)?.[text] || 0
        let replacement = "_".repeat(text.length)
        for (let i = 0; i < count; i++) {
          text = text.replace(text, replacement)
        }
        return text
      }

      let startIndex = this.indexOf(cleanText(fullText, container), text)
      if (startIndex > -1) {
        let countMap = this.findRangeTextNodesMap.get(container) || {}
        countMap[text] = (countMap[text] || 0) + 1
        this.findRangeTextNodesMap.set(container, countMap)
      }
      let endIndex = startIndex + text.length
      this.sentenceOffset = { startIndex, endIndex }
    }
    return this.sentenceOffset
  }

  private findRangeTextNodes(
    text: string,
    container: HTMLElement | null,
    wordOffset: { startIndex: number; endIndex: number } | undefined
  ): { node: Text; offset: number }[] {
    const result: { node: Text; offset: number }[] = []
    if (!container) return result

    const treeWalker = document.createTreeWalker(
      container,
      NodeFilter.SHOW_TEXT
    )
    const innerText = container.innerText.replace(/\n+/g, "")
    const textContent = (container.textContent || "").replace(/\n/g, " ")
    let { startIndex, endIndex } = this.getSentenceOffset(
      text,
      container,
      innerText
    )

    if (wordOffset) {
      endIndex = startIndex + wordOffset.endIndex
      startIndex = startIndex + wordOffset.startIndex
    }

    const offsetMap = this.calcInnerTextAndTextContentOffset(
      innerText,
      textContent
    )
    let innerTextOffset = 0
    let textContentOffset = 0

    for (const [index, offset] of Object.entries(offsetMap)) {
      const numIndex = +index
      if (numIndex <= startIndex) {
        innerTextOffset += offset
      }
      if (numIndex <= endIndex) {
        textContentOffset += offset
      }
    }

    startIndex += innerTextOffset
    endIndex += textContentOffset

    let currentOffset = 0
    let nodeCount = 0
    let currentNode = treeWalker.nextNode() as Text | null

    while (currentNode) {
      const nodeValue = currentNode.nodeValue || ""
      const start = currentOffset
      const end = currentOffset + nodeValue.length

      if (start <= startIndex && startIndex < end) {
        result.push({ node: currentNode, offset: startIndex - start })
      }
      if (start < endIndex && endIndex <= end) {
        result.push({ node: currentNode, offset: endIndex - start })
      }

      if (result.length === 2) break

      currentOffset = end
      nodeCount++
      currentNode = treeWalker.nextNode() as Text | null
    }

    return result
  }

  private indexOf(text: string, search: string): number {
    return text.indexOf(search)
  }

  private calcInnerTextAndTextContentOffset(
    innerText: string,
    textContent: string
  ): Record<number, number> {
    const offsetMap: Record<number, number> = {}
    let innerTextIndex = 0

    for (let i = 0; i < textContent.length; i++) {
      if (textContent[i] !== innerText[innerTextIndex]) {
        offsetMap[innerTextIndex] = (offsetMap[innerTextIndex] || 0) + 1
      } else {
        innerTextIndex++
      }
    }

    return offsetMap
  }

  private setContainerStyle(
    blockContainer: HTMLElement | null,
    textNodeContainer: HTMLElement | null,
    sentencePos: number[],
    wordPos?: number[]
  ): void {
    if (!blockContainer || !textNodeContainer) return

    const {
      sentenceColor,
      sentenceDarkColor,
      sentenceRadius,
      wordColor,
      wordDarkColor,
      wordRadius
    } = this
    const isDarkText = this.isDarkText(
      getComputedStyle(textNodeContainer).color
    )
    const currentBackgroundImage =
      getComputedStyle(blockContainer).backgroundImage

    if (!currentBackgroundImage.includes("paint(highlightSentence)")) {
      let newBackgroundImage =
        currentBackgroundImage === "none"
          ? ""
          : currentBackgroundImage
              .split(",")
              .filter((img) => {
                img = img.trim()
                return (
                  img !== "paint(highlightWord)" &&
                  img !== "paint(highlightSentence)"
                )
              })
              .join(",")
      newBackgroundImage = `paint(highlightWord),paint(highlightSentence)${newBackgroundImage ? "," + newBackgroundImage : ""}`
      blockContainer.style.setProperty("background-image", newBackgroundImage)
    }

    blockContainer.style.setProperty(
      "--highlightSentencePos",
      sentencePos.join(",")
    )
    blockContainer.style.setProperty(
      "--highlightSentenceColor",
      isDarkText ? sentenceDarkColor : sentenceColor
    )
    blockContainer.style.setProperty(
      "--highlightSentenceRadius",
      sentenceRadius.toString()
    )

    if (wordPos) {
      blockContainer.style.setProperty("--highlightWordPos", wordPos.join(","))
      blockContainer.style.setProperty(
        "--highlightWordColor",
        isDarkText ? wordDarkColor : wordColor
      )
      blockContainer.style.setProperty(
        "--highlightWordRadius",
        wordRadius.toString()
      )
    }
  }

  private isDarkText(color: string): boolean {
    // 假设这个方法检查颜色是否为暗色
    // 这里需要根据实际需求实现
    return true
  }

  private removeContainerStyle(container: HTMLElement): void {
    const currentBackgroundImage = getComputedStyle(container)
      .backgroundImage.split(",")
      .filter((img) => {
        img = img.trim()
        return (
          img !== "paint(highlightWord)" && img !== "paint(highlightSentence)"
        )
      })
      .join(",")

    if (currentBackgroundImage === "none") {
      container.style.removeProperty("background-image")
    } else {
      container.style.setProperty("background-image", currentBackgroundImage)
    }

    container.style.removeProperty("--highlightSentencePos")
    container.style.removeProperty("--highlightSentenceColor")
    container.style.removeProperty("--highlightSentenceRadius")
    container.style.removeProperty("--highlightWordPos")
    container.style.removeProperty("--highlightWordColor")
    container.style.removeProperty("--highlightWordRadius")
  }

  private unhighlight(): void {
    if (this.textNodeBlockContainer) {
      this.removeContainerStyle(this.textNodeBlockContainer)
    }
  }

  private debounce<T extends (...args: any[]) => any>(fn: T, delay: number): T {
    let timeoutId: NodeJS.Timeout
    return ((...args: Parameters<T>) => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => fn(...args), delay)
    }) as T
  }

  clear(): void {
    this.resizeOb?.disconnect()
    this.unhighlight()
    this.findTextNodeContainerMap.clear()
    this.findRangeTextNodesMap.clear()
  }

  rewind(): void {
    this.findTextNodeContainerMap.clear()
    this.findRangeTextNodesMap.clear()
  }
}

export default Highlighter
