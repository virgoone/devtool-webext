import ReactDOM from "react-dom/client"

import "~/assets/tailwind.css"

import { debug } from "@/utils/debug"

import { App } from "./app"
import { updateReference } from "./reference"

export default defineContentScript({
  matches: ["<all_urls>"],
  cssInjectionMode: "ui",
  allFrames: true,
  async main(ctx) {
    let observer: MutationObserver
    await createShadowRootUi(ctx, {
      name: "devtool-extension",
      anchor: "html",
      position: "overlay",
      zIndex: 2147483647,
      isolateEvents: true,
      onMount: (uiContainer: HTMLElement, shadow: ShadowRoot) => {
        if (window.top !== window) {
          console.log("Extension already exists in this frame")
          return
        }
        // 样式隔离处理：确保shadow DOM不受页面字体大小影响
        const handleStyleIsolation = () => {
          // 获取页面根元素的字体大小
          const rootFontSize = parseFloat(
            getComputedStyle(document.documentElement).fontSize
          )
          const bodyFontSize = parseFloat(
            getComputedStyle(document.body).fontSize
          )

          // 使用较大的字体大小作为参考（页面可能同时设置了html和body的font-size）
          const pageFontSize = Math.max(rootFontSize, bodyFontSize)
          const scaleFactor = pageFontSize / 16

          debug(
            "Page font size detected:",
            pageFontSize,
            "Scale factor:",
            scaleFactor,
            "Root font size:",
            rootFontSize,
            "Body font size:",
            bodyFontSize
          )

          // 如果页面字体大小不是标准的16px，就需要隔离样式
          if (Math.abs(scaleFactor - 1) > 0.01) {
            debug("Non-standard font size detected, applying style isolation")

            // 方法1: 在shadow DOM内部注入隔离样式，重写根元素字体大小
            const isolationStyle = document.createElement("style")
            isolationStyle.textContent = `
              :host {
                font-size: 16px !important;
                transform: scale(${1 / scaleFactor}) !important;
                transform-origin: top left !important;
                line-height: normal !important;
                letter-spacing: normal !important;
                word-spacing: normal !important;
              }
              /* 重写根元素字体大小，确保rem单位基于16px计算 */
              html, :host {
                font-size: 16px !important;
              }
              /* 确保所有元素使用正确的字体大小 */
              *, *::before, *::after {
                box-sizing: border-box !important;
              }
            `

            // 移除旧的隔离样式
            const oldIsolationStyle = shadow.querySelector(
              "#font-size-isolation"
            )
            if (oldIsolationStyle) {
              oldIsolationStyle.remove()
            }

            isolationStyle.id = "font-size-isolation"
            shadow.appendChild(isolationStyle)
            debug("Isolation style injected into shadow DOM")

            // 处理 shadow DOM 中现有的样式，转换 rem 单位
            const existingStyles = Array.from(shadow.querySelectorAll("style"))
            existingStyles.forEach((style) => {
              if (style.id !== "font-size-isolation") {
                let content = style.textContent || ""
                const newContent = content.replace(
                  /(\d+(?:\.\d+)?)rem/g,
                  (match, value) => {
                    const pxValue = parseFloat(value) * 16
                    return `${pxValue}px`
                  }
                )
                if (newContent !== content) {
                  style.textContent = newContent
                  debug("Converted rem units to px in shadow DOM styles")
                }
              }
            })

            // 方法2: 同时在host元素上设置样式作为备用
            if (shadow.host instanceof HTMLElement) {
              shadow.host.style.setProperty("font-size", "16px", "important")
              shadow.host.style.setProperty(
                "transform",
                `scale(${1 / scaleFactor})`,
                "important"
              )
              shadow.host.style.setProperty(
                "transform-origin",
                "top left",
                "important"
              )
              debug("Host element styles applied:", {
                fontSize: shadow.host.style.fontSize,
                transform: shadow.host.style.transform,
                transformOrigin: shadow.host.style.transformOrigin
              })
            }
          } else {
            // 标准字体大小，移除隔离样式
            const isolationStyle = shadow.querySelector("#font-size-isolation")
            if (isolationStyle) {
              isolationStyle.remove()
            }

            if (shadow.host instanceof HTMLElement) {
              shadow.host.style.removeProperty("transform")
              shadow.host.style.removeProperty("transform-origin")
            }
          }
        }

        // 创建样式变化观察器
        observer = new MutationObserver(() => {
          handleStyleIsolation()
        })

        // 开始观察
        observer.observe(document.documentElement, {
          attributes: true,
          attributeFilter: ["style"]
        })

        // 初始处理样式隔离
        handleStyleIsolation()

        updateReference(shadow)

        // 修正样式(sonner组件的样式会被注入到head中，将其移动到shadow之中)
        const sonnerStyle = Array.from(
          document.head.querySelectorAll("style")
        ).filter((o) => o.textContent?.includes("data-sonner-toaster"))?.[0]
        if (sonnerStyle) {
          shadow.head.appendChild(sonnerStyle)
        }

        // 样式注入：处理 Tailwind 样式并转换 rem 单位
        const handleEssentialStyles = (currentScaleFactor: number) => {
          // 查找包含 Tailwind 核心样式的 style 标签
          const essentialStyles = Array.from(
            document.head.querySelectorAll("style")
          ).filter((style) => {
            const content = style.textContent || ""
            return content.includes("@tailwind") || content.includes("@theme")
          })

          essentialStyles.forEach((style) => {
            if (style.parentNode) {
              const clonedStyle = style.cloneNode(true) as HTMLStyleElement
              let content = clonedStyle.textContent || ""

              // 如果页面字体大小不是标准的，需要转换 rem 单位
              if (Math.abs(currentScaleFactor - 1) > 0.01) {
                // 将 rem 单位转换为 px 单位 (1rem = 16px)
                content = content.replace(
                  /(\d+(?:\.\d+)?)rem/g,
                  (match, value) => {
                    const pxValue = parseFloat(value) * 16
                    return `${pxValue}px`
                  }
                )
                clonedStyle.textContent = content
                debug("Converted rem units to px in Tailwind styles")
              }

              shadow.head.appendChild(clonedStyle)
              debug("Moved essential Tailwind style to shadow DOM")
            }
          })

          // 处理已经存在于 shadow DOM 中的样式
          const shadowStyles = Array.from(shadow.querySelectorAll("style"))
          shadowStyles.forEach((style) => {
            let content = style.textContent || ""
            if (Math.abs(currentScaleFactor - 1) > 0.01) {
              // 将 rem 单位转换为 px 单位
              const newContent = content.replace(
                /(\d+(?:\.\d+)?)rem/g,
                (match, value) => {
                  const pxValue = parseFloat(value) * 16
                  return `${pxValue}px`
                }
              )
              if (newContent !== content) {
                style.textContent = newContent
                debug("Converted rem units to px in existing shadow DOM styles")
              }
            }
          })
        }

        // 延迟处理，确保所有样式都已加载
        setTimeout(() => {
          const rootFontSize = parseFloat(
            getComputedStyle(document.documentElement).fontSize
          )
          const bodyFontSize = parseFloat(
            getComputedStyle(document.body).fontSize
          )
          const pageFontSize = Math.max(rootFontSize, bodyFontSize)
          const currentScaleFactor = pageFontSize / 16
          handleEssentialStyles(currentScaleFactor)
        }, 100)
        const wrapper = document.createElement("div")
        wrapper.id = "devtool-extension-root"
        uiContainer.append(wrapper)

        const root = ReactDOM.createRoot(wrapper)
        root.render(<App />)

        return {
          root,
          wrapper
        }
      },
      onRemove: (elements) => {
        elements?.root.unmount()
        elements?.wrapper.remove()
        observer?.disconnect()
      }
    }).then((ui) => ui.mount())
  }
})
