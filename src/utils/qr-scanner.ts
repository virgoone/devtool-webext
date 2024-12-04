import jsQR from "jsqr"

export async function scanQRCodeFromImage(imageUrl: string): Promise<string> {
  try {
    // 获取图片数据
    const response = await fetch(imageUrl)
    if (!response.ok) {
      throw new Error("Failed to fetch image")
    }

    const blob = await response.blob()
    const imageBitmap = await createImageBitmap(blob)

    // 检查图片尺寸
    if (imageBitmap.width > 4096 || imageBitmap.height > 4096) {
      throw new Error("Image dimensions too large")
    }

    // 创建离屏 canvas
    const offscreenCanvas = new OffscreenCanvas(imageBitmap.width, imageBitmap.height)
    const ctx = offscreenCanvas.getContext('2d', {
      willReadFrequently: true
    })

    if (!ctx) {
      throw new Error("Failed to create canvas context")
    }

    // 绘制图片到 canvas
    ctx.drawImage(imageBitmap, 0, 0)

    // 获取图片数据
    const imageData = ctx.getImageData(0, 0, imageBitmap.width, imageBitmap.height)

    // 清理资源
    imageBitmap.close()

    // 扫描二维码
    const code = jsQR(imageData.data, imageData.width, imageData.height)

    if (code) {
      return code.data
    } else {
      throw new Error("No QR code found in image")
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error("Failed to process image")
  }
}