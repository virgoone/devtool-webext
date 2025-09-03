import ReactDOM from "react-dom/client"

import "~/assets/tailwind.css"
import "@/locales"

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
        // 简单的字体隔离处理
        const handleStyleIsolation = () => {
          const rootFontSize = parseFloat(
            getComputedStyle(document.documentElement).fontSize
          )
          const bodyFontSize = parseFloat(
            getComputedStyle(document.body).fontSize
          )

          debug("Font size check:", { rootFontSize, bodyFontSize })

          debug("Large font detected, converting rem to em")

          // 在shadow DOM中设置固定字体大小16px
          const isolationStyle = document.createElement("style")
          isolationStyle.textContent = `:host { font-size: 16px !important; }`
          isolationStyle.id = "font-size-isolation"

          // 移除旧的样式
          const oldStyle = shadow.querySelector("#font-size-isolation")
          if (oldStyle) oldStyle.remove()

          shadow.appendChild(isolationStyle)

          // 处理页面head中的Tailwind样式
          const pageStyles = Array.from(document.head.querySelectorAll("style"))
          pageStyles.forEach((style) => {
            const content = style.textContent || ""
            if (
              content.includes("@tailwind") ||
              content.includes("@theme") ||
              content.includes("@layer")
            ) {
              const clonedStyle = style.cloneNode(true) as HTMLStyleElement
              const newContent = content.replace(/(\d*\.?\d+)rem\b/g, "$1em")
              clonedStyle.textContent = newContent
              shadow.head.appendChild(clonedStyle)
              debug("Copied and converted Tailwind style from head")
            }
          })

          // 将shadow DOM中现有样式的rem替换为em
          const shadowStyles = Array.from(shadow.querySelectorAll("style"))
          shadowStyles.forEach((style) => {
            if (style.id !== "font-size-isolation") {
              const content = style.textContent || ""
              const newContent = content.replace(/(\d*\.?\d+)rem\b/g, "$1em")
              if (newContent !== content) {
                style.textContent = newContent
                debug("Converted rem to em in shadow DOM")
              }
            }
          })
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

        // 延迟处理样式，确保所有样式都已加载
        setTimeout(() => {
          handleStyleIsolation()
        }, 100)
        const wrapper = document.createElement("div")
        wrapper.id = "devtool-extension-root"
        uiContainer.append(wrapper)

        // 直接渲染组件，WXT i18n 会自动处理
        const root = ReactDOM.createRoot(wrapper)
        root.render(<App />)

        return {
          wrapper
        }
      },
      onRemove: (elements) => {
        elements?.wrapper.remove()
        observer?.disconnect()
      }
    }).then((ui) => ui.mount())
  }
})
