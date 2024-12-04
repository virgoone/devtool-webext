export async function copyImageToClipboard(svgElement: SVGElement): Promise<void> {
  try {
    // Convert SVG to canvas
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    // Convert SVG to data URL
    const svgData = new XMLSerializer().serializeToString(svgElement)
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(svgBlob)

    return new Promise((resolve, reject) => {
      img.onload = async () => {
        canvas.width = img.width
        canvas.height = img.height
        ctx.drawImage(img, 0, 0)

        try {
          const blob = await new Promise<Blob>((resolve) =>
            canvas.toBlob((blob) => resolve(blob), 'image/png')
          )

          await navigator.clipboard.write([
            new ClipboardItem({
              'image/png': blob
            })
          ])
          resolve()
        } catch (err) {
          reject(err)
        } finally {
          URL.revokeObjectURL(url)
        }
      }

      img.src = url
    })
  } catch (error) {
    throw new Error('Failed to copy image: ' + (error as Error).message)
  }
}