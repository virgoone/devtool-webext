"use strict"

;(() => {
  const properties: string[] = ["pos", "color", "radius"]

  // 定义类型别名
  type PaintContext = {
    fillStyle: string
    save: () => void
    restore: () => void
    beginPath: () => void
    moveTo: (x: number, y: number) => void
    arcTo: (
      x1: number,
      y1: number,
      x2: number,
      y2: number,
      radius: number
    ) => void
    closePath: () => void
    fill: () => void
  }

  type PaintSize = {
    width: number
    height: number
  }

  type PaintProperties = {
    get: (property: string) => string | string[]
  }

  // 辅助函数
  const getPropertyValue = (
    properties: PaintProperties,
    key: string
  ): string | number | undefined => {
    const value = properties.get(key)
    return typeof value !== "string" ? value?.[0] : value
  }

  function capitalizeFirstLetter(str: string): string {
    return `${str[0].toUpperCase()}${str.slice(1)}`
  }

  function createPaintClass(name: string): typeof PaintClass {
    const cssProperties: Record<string, string> = {}
    const inputProperties: string[] = []

    properties.forEach((prop) => {
      const cssProp = `--${name}${capitalizeFirstLetter(prop)}`
      cssProperties[prop] = cssProp
      inputProperties.push(cssProp)
    })

    class PaintClass {
      static get inputProperties(): string[] {
        return inputProperties
      }

      paint(
        ctx: PaintContext,
        geom: PaintSize,
        properties: PaintProperties
      ): void {
        const posValue = getPropertyValue(properties, cssProperties.pos)
        const pos = posValue?.split(",").map(Number)
        const radius = +(
          getPropertyValue(properties, cssProperties.radius) || 4
        )
        const color = getPropertyValue(properties, cssProperties.color) as
          | string
          | undefined

        const rectangles = pos
          ? new Array(pos.length / 4)
              .fill(0)
              .map((_, index) => pos.slice(index * 4, index * 4 + 4))
          : []

        if (pos && color) {
          ctx.fillStyle = color
          for (const rect of rectangles) {
            ctx.save()
            const [x, y, width, height] = rect
            let adjustedRadius = radius

            if (width < 2 * adjustedRadius) {
              adjustedRadius = width / 2
            }
            if (height < 2 * adjustedRadius) {
              adjustedRadius = height / 2
            }

            ctx.beginPath()
            ctx.moveTo(x + adjustedRadius, y)
            ctx.arcTo(x + width, y, x + width, y + height, adjustedRadius)
            ctx.arcTo(x + width, y + height, x, y + height, adjustedRadius)
            ctx.arcTo(x, y + height, x, y, adjustedRadius)
            ctx.arcTo(x, y, x + width, y, adjustedRadius)
            ctx.closePath()
            ctx.fill()
            ctx.restore()
          }
        }
      }
    }

    return PaintClass
  }

  if ("registerPaint" in globalThis) {
    ;["highlightSentence", "highlightWord"].forEach((name) => {
      const PaintClass = createPaintClass(name)
      ;(globalThis as any).registerPaint(name, PaintClass)
    })
  }
})()
