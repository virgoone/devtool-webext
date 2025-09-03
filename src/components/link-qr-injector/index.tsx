import { QrCode } from "lucide-react"
import React, { useCallback, useEffect, useRef } from "react"
import ReactDOM from "react-dom/client"

import { debug } from "@/utils/debug"

interface LinkQRInjectorProps {
  onGenerateQR: (url: string) => void
  enabled: boolean
}

// 二维码图标组件
const QRIconComponent = ({
  onClick,
  isTextUrl = false
}: {
  onClick: () => void
  isTextUrl?: boolean
}) => {
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()

      debug("点击二维码图标，准备生成二维码")

      // 设置标志，防止 FloatingToolbar 闪现
      // @ts-ignore
      window._devtoolQRIconClicking = true

      onClick()

      // 短时间后清除标志
      setTimeout(() => {
        // @ts-ignore
        window._devtoolQRIconClicking = false
      }, 100)
    },
    [onClick]
  )

  return (
    <span
      className={`devtool-qr-icon ${isTextUrl ? "text-url" : "link-url"}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: "16px",
        height: "16px",
        marginLeft: "4px",
        cursor: "pointer",
        borderRadius: "3px",
        background: isTextUrl
          ? "rgba(16, 185, 129, 0.1)"
          : "rgba(102, 126, 234, 0.1)",
        border: `1px solid ${isTextUrl ? "rgba(16, 185, 129, 0.3)" : "rgba(102, 126, 234, 0.3)"}`,
        transition: "all 0.2s ease",
        verticalAlign: "middle",
        position: "relative",
        zIndex: 1,
        opacity: 0.6,
        userSelect: "none" // 防止图标被选中
      }}
      onMouseEnter={(e) => {
        const target = e.currentTarget as HTMLElement
        target.style.opacity = "0.9"
        target.style.background = isTextUrl
          ? "rgba(16, 185, 129, 0.15)"
          : "rgba(102, 126, 234, 0.15)"
        target.style.borderColor = isTextUrl
          ? "rgba(16, 185, 129, 0.5)"
          : "rgba(102, 126, 234, 0.5)"
      }}
      onMouseLeave={(e) => {
        const target = e.currentTarget as HTMLElement
        target.style.opacity = "0.6"
        target.style.background = isTextUrl
          ? "rgba(16, 185, 129, 0.1)"
          : "rgba(102, 126, 234, 0.1)"
        target.style.borderColor = isTextUrl
          ? "rgba(16, 185, 129, 0.3)"
          : "rgba(102, 126, 234, 0.3)"
      }}
      onMouseDown={(e) => {
        e.preventDefault()
        e.stopPropagation()
      }}
      onMouseUp={(e) => {
        e.preventDefault()
        e.stopPropagation()
      }}
      onClick={handleClick}
      title="点击生成二维码">
      <QrCode
        size={12}
        color={isTextUrl ? "#10b981" : "#667eea"}
        style={{ pointerEvents: "none" }} // 防止SVG图标干扰事件
      />
    </span>
  )
}

export function LinkQRInjector({ onGenerateQR, enabled }: LinkQRInjectorProps) {
  const debounceTimer = useRef<NodeJS.Timeout | undefined>(undefined)
  const processedUrls = useRef<Set<string>>(new Set())
  const processedNodes = useRef<Set<Node>>(new Set())

  // URL正则表达式，匹配文本中的URL（支持查询参数、锚点和复杂路径）
  const httpUrlRegex =
    /https?:\/\/[^\s\u00A0\u2000-\u200A\u202F\u205F\u3000<>"'\u4e00-\u9fff]+/g
  const domainUrlRegex =
    /(?:^|\s)((?:www\.)?[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+(?:\/[^\s\u00A0\u2000-\u200A\u202F\u205F\u3000<>"'\u4e00-\u9fff]*)?)/g

  // 检查链接是否已经处理过
  const isLinkProcessed = (link: HTMLAnchorElement): boolean => {
    return link.hasAttribute("data-qr-injected")
  }

  // 检查文本节点是否已经处理过
  const isTextNodeProcessed = (node: Node): boolean => {
    return processedNodes.current.has(node)
  }

  // 标记链接已处理
  const markLinkAsProcessed = (link: HTMLAnchorElement) => {
    link.setAttribute("data-qr-injected", "true")
  }

  // 标记文本节点已处理
  const markTextNodeAsProcessed = (node: Node) => {
    processedNodes.current.add(node)
  }

  // 检查是否是有效的URL文本
  const isValidUrlText = (url: string): boolean => {
    // 清理URL文本（移除末尾的标点符号）
    const cleanUrl = url.replace(/[.,;!?)"']*$/, "").trim()

    debug(`验证URL: "${cleanUrl}"`)

    // 基本长度检查
    if (cleanUrl.length < 4) {
      debug(`URL太短: ${cleanUrl.length}`)
      return false
    }

    try {
      // 尝试构建URL
      let testUrl = cleanUrl
      if (!testUrl.startsWith("http")) {
        testUrl = "https://" + testUrl
      }
      const urlObj = new URL(testUrl)
      debug(`URL验证成功: ${urlObj.href}`)
      return true
    } catch (error) {
      debug(`URL验证失败: ${cleanUrl}, 错误:`, error)
      return false
    }
  }

  // 创建文本URL的二维码图标（使用React组件渲染）
  const createTextQRIcon = useCallback(
    (url: string): HTMLSpanElement => {
      const container = document.createElement("span")
      container.className = "devtool-text-qr-icon-container"

      const root = ReactDOM.createRoot(container)
      root.render(
        <QRIconComponent
          isTextUrl={true}
          onClick={() => {
            let fullUrl = url.trim()
            if (!fullUrl.startsWith("http")) {
              fullUrl = "https://" + fullUrl
            }
            debug("生成文本URL二维码:", fullUrl)
            onGenerateQR(fullUrl)
          }}
        />
      )

      // 保存root引用以便后续清理
      // @ts-ignore
      container._reactRoot = root

      return container
    },
    [onGenerateQR]
  )

  // 处理a标签内的文本URL（特殊处理，避免破坏链接结构）
  const processTextUrlInLink = useCallback(
    (textNode: Node, linkElement: HTMLAnchorElement, urls: string[]) => {
      const text = textNode.textContent || ""
      const validUrls = urls.filter(url => isValidUrlText(url) && !processedUrls.current.has(url))
      
      if (validUrls.length === 0) {
        markTextNodeAsProcessed(textNode)
        return
      }

      debug(`在a标签内处理 ${validUrls.length} 个文本URL`)

      // 为每个有效URL创建图标
      validUrls.forEach(url => {
        const icon = createTextQRIcon(url)
        processedUrls.current.add(url)
        
        // 将图标插入到a标签后面，而不是内部
        const linkParent = linkElement.parentElement
        if (linkParent) {
          // 在链接后面插入图标
          if (linkElement.nextSibling) {
            linkParent.insertBefore(icon, linkElement.nextSibling)
          } else {
            linkParent.appendChild(icon)
          }
          
          // 添加一点间距
          icon.style.marginLeft = "4px"
          
          debug(`✅ 成功为a标签内的文本URL添加外部图标: ${url}`)
        }
      })

      markTextNodeAsProcessed(textNode)
    },
    [createTextQRIcon]
  )

  // 处理包含URL的文本节点
  const processTextNode = useCallback(
    (textNode: Node) => {
      if (isTextNodeProcessed(textNode)) return
      if (textNode.nodeType !== Node.TEXT_NODE) return

      const text = textNode.textContent || ""
      if (text.trim().length < 10) return // 太短的文本不处理

      // 查找文本中的URL
      const httpUrls = text.match(httpUrlRegex) || []
      const domainUrls = text.match(domainUrlRegex) || []
      const allUrls = [...httpUrls, ...domainUrls.map((match) => match.trim())]

      if (allUrls.length === 0) return

      debug(`在文本中发现 ${allUrls.length} 个URL:`, allUrls)

      let hasValidUrl = false
      allUrls.forEach((url) => {
        if (isValidUrlText(url) && !processedUrls.current.has(url)) {
          hasValidUrl = true
        }
      })

      if (!hasValidUrl) return

      try {
        const parent = textNode.parentElement
        if (!parent) return

        // 检查父元素是否应该跳过
        if (shouldSkipTextContainer(parent)) {
          markTextNodeAsProcessed(textNode)
          return
        }

        // 特殊处理：如果父元素是a标签，需要特别小心处理
        const isInLinkTag = parent.tagName.toLowerCase() === 'a'
        if (isInLinkTag) {
          debug(`检测到a标签内的文本URL，父链接href: ${parent.getAttribute('href')}`)
          
          // 对于a标签内的文本URL，我们采用外部插入的方式
          // 避免破坏原有链接的点击功能
          processTextUrlInLink(textNode, parent as HTMLAnchorElement, allUrls)
          return
        }

        // 分割文本并插入图标
        const fragments: (string | HTMLElement)[] = []
        let lastIndex = 0

        // 先处理HTTP URL，再处理域名URL
        let remainingText = text
        let currentOffset = 0

        // 处理HTTP URL
        const httpMatches: Array<{ url: string; index: number }> = []
        let httpMatch
        const httpRegex = new RegExp(httpUrlRegex.source, "g")
        while ((httpMatch = httpRegex.exec(text)) !== null) {
          const url = httpMatch[0]
          if (isValidUrlText(url)) {
            httpMatches.push({ url, index: httpMatch.index })
          }
        }

        // 处理域名URL（避免与HTTP URL重叠）
        const domainMatches: Array<{ url: string; index: number }> = []
        let domainMatch
        const domainRegex = new RegExp(domainUrlRegex.source, "g")
        while ((domainMatch = domainRegex.exec(text)) !== null) {
          const url = domainMatch[1] // 第一个捕获组
          const index = domainMatch.index + (domainMatch[0].length - url.length) // 调整索引

          if (isValidUrlText(url)) {
            // 检查是否与HTTP URL重叠
            const overlaps = httpMatches.some(
              (httpMatch) =>
                Math.abs(httpMatch.index - index) <
                Math.max(httpMatch.url.length, url.length)
            )
            if (!overlaps) {
              domainMatches.push({ url, index })
            }
          }
        }

        // 合并并排序所有匹配
        const allMatches = [...httpMatches, ...domainMatches].sort(
          (a, b) => a.index - b.index
        )

        if (allMatches.length === 0) return

        allMatches.forEach(({ url, index }) => {
          if (!isValidUrlText(url)) return

          // 添加URL前的文本
          if (index > lastIndex) {
            fragments.push(text.substring(lastIndex, index))
          }

          // 添加URL文本
          fragments.push(url)

          // 添加二维码图标
          if (!processedUrls.current.has(url)) {
            const icon = createTextQRIcon(url)
            fragments.push(icon)
            processedUrls.current.add(url)
          }

          lastIndex = index + url.length
        })

        // 添加剩余文本
        if (lastIndex < text.length) {
          fragments.push(text.substring(lastIndex))
        }

        // 创建新的容器来替换原文本节点
        const container = document.createElement("span")
        container.className = "devtool-url-processed"

        fragments.forEach((fragment) => {
          if (typeof fragment === "string") {
            container.appendChild(document.createTextNode(fragment))
          } else {
            container.appendChild(fragment)
          }
        })

        // 替换原文本节点
        parent.replaceChild(container, textNode)
        markTextNodeAsProcessed(textNode)

        debug("✅ 成功处理文本节点URL")
      } catch (error) {
        debug("❌ 处理文本节点失败:", error)
      }
    },
    [createTextQRIcon]
  )

  // 检查文本容器是否应该跳过
  const shouldSkipTextContainer = (element: Element): boolean => {
    // 跳过脚本、样式、代码等标签，但允许处理a标签内的文本URL
    const tagName = element.tagName.toLowerCase()
    const skipTags = [
      "script",
      "style",
      "code",
      "pre",
      "textarea",
      "input",
      "noscript"
      // 移除 "a" - 允许处理a标签内的文本URL
    ]
    if (skipTags.includes(tagName)) return true

    // 跳过特殊类名的容器
    const className = element.className.toLowerCase()
    const skipClasses = ["code", "highlight", "script", "json", "devtool"]
    if (skipClasses.some((cls) => className.includes(cls))) return true

    // 跳过已经被我们处理过的容器
    if (element.classList.contains("devtool-url-processed")) return true

    return false
  }

  // 检查链接是否应该被排除（提高可见性，减少误判）
  const shouldSkipLink = (
    link: HTMLAnchorElement,
    linkText: string
  ): boolean => {
    // 检查链接是否在特殊容器中（如导航栏、按钮等）
    const parent = link.closest(
      'nav, .nav, .navbar, .menu, .btn, .button, [role="button"], [role="menuitem"]'
    )
    if (parent) {
      debug(`跳过导航/按钮链接: ${linkText}`)
      return true
    }

    // 检查链接是否有特殊类名
    const className = link?.className?.toLowerCase() || ""
    const skipClasses = [
      "btn",
      "button",
      "nav",
      "menu",
      "tab",
      "close",
      "toggle"
    ]
    if (skipClasses.some((cls) => className.includes(cls))) {
      debug(`跳过特殊类名链接: ${className}`)
      return true
    }

    return false
  }

  // 创建二维码图标（使用React组件渲染）
  const createQRIcon = useCallback(
    (link: HTMLAnchorElement): HTMLSpanElement => {
      const container = document.createElement("span")
      container.className = "devtool-qr-icon-container"

      const root = ReactDOM.createRoot(container)
      root.render(
        <QRIconComponent
          isTextUrl={false}
          onClick={() => {
            let url = link.href
            // 如果是相对链接，转换为绝对链接
            if (!url.startsWith("http")) {
              url = new URL(
                link.getAttribute("href") || "",
                window.location.href
              ).href
            }
            debug("生成链接二维码:", url)
            onGenerateQR(url)
          }}
        />
      )

      // 保存root引用以便后续清理
      // @ts-ignore
      container._reactRoot = root

      return container
    },
    [onGenerateQR]
  )

  // 处理单个链接
  const processLink = useCallback(
    (link: HTMLAnchorElement) => {
      if (isLinkProcessed(link)) return

      const href = link.getAttribute("href")
      if (!href) {
        debug("跳过: 无href属性")
        return
      }

      // 跳过邮件链接、电话链接等
      if (
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        href.startsWith("javascript:") ||
        href.startsWith("#")
      ) {
        debug(`跳过非HTTP链接: ${href}`)
        markLinkAsProcessed(link)
        return
      }

      // 检查是否是有效的链接
      let fullUrl: string
      try {
        fullUrl = href.startsWith("http")
          ? href
          : new URL(href, window.location.href).href
      } catch {
        debug(`跳过无效URL: ${href}`)
        markLinkAsProcessed(link)
        return
      }

      // 放宽URL验证条件 - 只要能构建成功的URL都认为是有效的
      if (!fullUrl.startsWith("http")) {
        debug(`跳过非HTTP URL: ${fullUrl}`)
        markLinkAsProcessed(link)
        return
      }

      // 获取链接文本用于后续判断
      const linkText = link.textContent?.toLowerCase().trim() || ""

      // 检查是否应该跳过这个链接
      if (shouldSkipLink(link, linkText)) {
        markLinkAsProcessed(link)
        return
      }

      // 跳过特定的链接文本（避免干扰页面功能）
      const skipPatterns = [
        "登录",
        "注册",
        "退出",
        "购买",
        "支付",
        "login",
        "register",
        "logout",
        "buy",
        "pay"
      ]
      if (skipPatterns.some((pattern) => linkText.includes(pattern))) {
        debug(`跳过敏感链接: ${linkText}`)
        markLinkAsProcessed(link)
        return
      }

      // 检查是否已经处理过这个URL（避免重复处理相同的链接）
      if (processedUrls.current.has(fullUrl)) {
        debug(`跳过重复URL: ${fullUrl}`)
        markLinkAsProcessed(link)
        return
      }

      // 创建并插入二维码图标
      const icon = createQRIcon(link)

      try {
        // 更智能的图标插入策略
        const parent = link.parentElement
        if (!parent) {
          debug("❌ 链接没有父元素，跳过")
          return
        }

        // 检查链接是否是行内元素的一部分
        const isInlineContext =
          window.getComputedStyle(link).display === "inline" ||
          window.getComputedStyle(parent).display === "inline"

        if (isInlineContext) {
          // 行内元素，直接插入到链接后面
          if (
            link.nextSibling &&
            link.nextSibling.nodeType === Node.TEXT_NODE &&
            link.nextSibling.textContent?.trim() === ""
          ) {
            // 如果下一个节点是空白文本，插入到空白文本后面
            parent.insertBefore(icon, link.nextSibling.nextSibling)
          } else if (link.nextSibling) {
            parent.insertBefore(icon, link.nextSibling)
          } else {
            parent.appendChild(icon)
          }
        } else {
          // 块级元素，创建一个包装容器
          const wrapper = document.createElement("span")
          wrapper.style.display = "inline-flex"
          wrapper.style.alignItems = "center"
          wrapper.style.gap = "4px"

          // 将链接和图标都放入包装容器
          parent.insertBefore(wrapper, link)
          wrapper.appendChild(link)
          wrapper.appendChild(icon)
        }

        markLinkAsProcessed(link)
        processedUrls.current.add(fullUrl)
        debug("✅ 成功为链接添加二维码图标:", fullUrl, "文本:", linkText)
      } catch (error) {
        debug("❌ 插入图标失败:", error, "链接:", fullUrl)
      }
    },
    [onGenerateQR, createQRIcon]
  )

  // 性能优化的文本节点处理
  const processAllTextNodes = useCallback(() => {
    const startTime = performance.now()
    
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          // 跳过已处理的节点和特殊容器内的文本
          if (isTextNodeProcessed(node)) return NodeFilter.FILTER_REJECT

          const parent = node.parentElement
          if (!parent || shouldSkipTextContainer(parent)) {
            return NodeFilter.FILTER_REJECT
          }

          const text = node.textContent || ""
          if (text.trim().length < 10) return NodeFilter.FILTER_REJECT

          // 检查是否包含URL
          if (!httpUrlRegex.test(text) && !domainUrlRegex.test(text)) {
            return NodeFilter.FILTER_REJECT
          }

          return NodeFilter.FILTER_ACCEPT
        }
      }
    )

    const textNodes: Node[] = []
    let node
    let nodeCount = 0
    const MAX_NODES_PER_SCAN = 100 // 限制每次扫描的节点数量以避免卡顿
    
    while ((node = walker.nextNode()) && nodeCount < MAX_NODES_PER_SCAN) {
      textNodes.push(node)
      nodeCount++
    }

    debug(`检测到 ${textNodes.length} 个包含URL的文本节点${nodeCount >= MAX_NODES_PER_SCAN ? ' (已限制)' : ''}`)

    let processedCount = 0
    textNodes.forEach((textNode) => {
      processTextNode(textNode)
      processedCount++
    })

    const endTime = performance.now()
    const duration = endTime - startTime
    debug(`文本节点处理完成 - 处理: ${processedCount}, 耗时: ${duration.toFixed(2)}ms`)
    
    // 性能预警
    if (duration > 100) {
      debug(`⚠️ 文本节点处理耗时较长: ${duration.toFixed(2)}ms`)
    }
  }, [processTextNode])

  // 处理页面中的所有链接
  const processAllLinks = useCallback(() => {
    const links = document.querySelectorAll(
      "a[href]"
    ) as NodeListOf<HTMLAnchorElement>
    debug(`检测到 ${links.length} 个<a>标签链接`)

    let processedCount = 0
    let skippedCount = 0

    links.forEach((link) => {
      if (isLinkProcessed(link)) {
        skippedCount++
        return
      }

      const href = link.getAttribute("href")
      debug(`处理<a>链接: ${href}, 文本: ${link.textContent?.trim()}`)

      processLink(link)
      processedCount++
    })

    debug(
      `<a>标签处理完成 - 新处理: ${processedCount}, 已跳过: ${skippedCount}`
    )
  }, [processLink])

  // 只处理文本中的URL，不处理已经是链接的内容
  const processAll = useCallback(() => {
    debug("=== 开始全面检测（仅处理文本URL） ===")
    processAllTextNodes() // 只处理文本中的URL
    debug("=== 检测完成 ===")
  }, [processAllTextNodes])

  // 防抖处理新节点
  const debouncedProcessNewNodes = useCallback(
    (nodes: Node[]) => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }

      debounceTimer.current = setTimeout(() => {
        nodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element

            // 只处理元素内的文本节点，不处理链接
            const walker = document.createTreeWalker(
              element,
              NodeFilter.SHOW_TEXT,
              {
                acceptNode: (textNode) => {
                  if (isTextNodeProcessed(textNode))
                    return NodeFilter.FILTER_REJECT

                  const parent = textNode.parentElement
                  if (!parent || shouldSkipTextContainer(parent)) {
                    return NodeFilter.FILTER_REJECT
                  }

                  const text = textNode.textContent || ""
                  if (text.trim().length < 10) return NodeFilter.FILTER_REJECT

                  // 检查是否包含URL
                  if (!httpUrlRegex.test(text) && !domainUrlRegex.test(text)) {
                    return NodeFilter.FILTER_REJECT
                  }

                  return NodeFilter.FILTER_ACCEPT
                }
              }
            )

            let textNode
            while ((textNode = walker.nextNode())) {
              processTextNode(textNode)
            }
          } else if (node.nodeType === Node.TEXT_NODE) {
            // 直接是文本节点
            processTextNode(node)
          }
        })
      }, 500) // 适度的防抖时间，平衡响应速度和性能
    },
    [processTextNode]
  )

  // 处理新添加的节点
  const processNewNodes = useCallback(
    (nodes: Node[]) => {
      debouncedProcessNewNodes(nodes)
    },
    [debouncedProcessNewNodes]
  )

  // 清理所有二维码图标和标记
  const cleanupQRIcons = useCallback(() => {
    // 清理防抖定时器
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    // 清理缓存
    processedUrls.current.clear()
    processedNodes.current.clear()

    // 清理React渲染的图标容器
    const linkContainers = document.querySelectorAll(
      ".devtool-qr-icon-container"
    )
    const textContainers = document.querySelectorAll(
      ".devtool-text-qr-icon-container"
    )

    // 先卸载React根节点，再移除DOM元素
    linkContainers.forEach((container) => {
      try {
        // @ts-ignore
        if (container._reactRoot) {
          // @ts-ignore
          container._reactRoot.unmount()
        }
        container.remove()
      } catch (error) {
        debug("清理链接图标容器失败:", error)
        container.remove() // 备用清理方案
      }
    })

    textContainers.forEach((container) => {
      try {
        // @ts-ignore
        if (container._reactRoot) {
          // @ts-ignore
          container._reactRoot.unmount()
        }
        container.remove()
      } catch (error) {
        debug("清理文本图标容器失败:", error)
        container.remove() // 备用清理方案
      }
    })

    // 注意：不再处理链接标记，因为我们只处理文本URL

    // 恢复被处理的文本节点（将包装容器内容恢复为原文本）
    const processedContainers = document.querySelectorAll(
      ".devtool-url-processed"
    )
    processedContainers.forEach((container) => {
      try {
        const parent = container.parentElement
        if (parent && container.textContent) {
          const textNode = document.createTextNode(container.textContent)
          parent.replaceChild(textNode, container)
        }
      } catch (error) {
        debug("清理文本容器失败:", error)
      }
    })
  }, [])

  // 添加手动测试函数到全局，方便调试
  useEffect(() => {
    if (enabled) {
      // @ts-ignore
      window.devtoolDebugLinkQR = () => {
        debug("=== 手动调试链接和文本URL检测 ===")
        processAll()
        debug("=== 调试完成 ===")
      }
    } else {
      // @ts-ignore
      delete window.devtoolDebugLinkQR
    }
  }, [enabled, processAll])

  useEffect(() => {
    let observer: MutationObserver | null = null
    let timeoutId: NodeJS.Timeout | undefined = undefined

    if (enabled) {
      debug("LinkQRInjector: 功能已启用，开始检测链接")

      // 初始化处理现有链接和文本URL，使用多次检测确保覆盖所有情况
      const initialProcess = () => {
        debug("LinkQRInjector: 开始初始化检测")
        processAll()
      }

      // 立即执行一次
      initialProcess()

      // 延迟执行，处理异步加载的内容
      setTimeout(initialProcess, 500)
      setTimeout(initialProcess, 1500)
      setTimeout(initialProcess, 3000)
      setTimeout(initialProcess, 5000) // 再延迟一些，处理更慢的页面

      // 创建MutationObserver监听页面变化
      observer = new MutationObserver((mutations) => {
        const addedNodes: Node[] = []
        let hasRelevantChanges = false

        mutations.forEach((mutation) => {
          // 只检查新增节点，不再处理链接属性变化
          mutation.addedNodes.forEach((node) => {
            // 跳过我们自己添加的图标
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element
              if (!element.classList.contains("devtool-qr-icon")) {
                hasRelevantChanges = true
                addedNodes.push(node)
              }
            }
          })
        })

        if (hasRelevantChanges && addedNodes.length > 0) {
          debug(
            `LinkQRInjector: 检测到页面变化，准备处理 ${addedNodes.length} 个节点`
          )
          processNewNodes(addedNodes)
        }
      })

      // 开始观察页面变化，只监听DOM结构变化
      observer.observe(document.body, {
        childList: true,
        subtree: true
      })

      // 智能动态内容处理 - 性能优化版本
      let scanCount = 0
      let lastContentLength = document.body.textContent?.length || 0
      let hasRecentActivity = false
      const maxInitialScans = 8 // 减少初始密集扫描次数
      const maxLongTermScans = 15 // 减少总扫描次数以避免性能问题

      const intervalId = setInterval(() => {
        // 检查页面是否可见
        if (document.hidden) {
          debug(`LinkQRInjector: 页面隐藏，暂停扫描`)
          return
        }

        // 性能优化：检查页面内容是否有变化
        const currentContentLength = document.body.textContent?.length || 0
        const contentChanged = Math.abs(currentContentLength - lastContentLength) > 100 // 内容变化超过100字符才扫描
        
        if (scanCount >= maxLongTermScans && !hasRecentActivity) {
          debug(`LinkQRInjector: 达到最大扫描次数且无活动，停止定期扫描`)
          clearInterval(intervalId)
          return
        }

        scanCount++
        const isInitialPhase = scanCount <= maxInitialScans
        
        // 智能扫描：只在内容变化或初始阶段时进行全量扫描
        if (isInitialPhase || contentChanged || hasRecentActivity) {
          debug(
            `LinkQRInjector: 执行扫描 (${scanCount}/${maxLongTermScans}) ${
              isInitialPhase ? "[初始]" : contentChanged ? "[内容变化]" : "[用户活动]"
            }`
          )
          processAll()
          lastContentLength = currentContentLength
          hasRecentActivity = false // 重置活动标志
        } else {
          debug(`LinkQRInjector: 跳过扫描 - 无内容变化 (${scanCount}/${maxLongTermScans})`)
        }
      }, 8000) // 调整为8秒，减少扫描频率

      // 性能优化的滚动触发检测
      let scrollTimer: NodeJS.Timeout | undefined
      let lastScrollTime = 0
      const SCROLL_THROTTLE = 2000 // 滚动节流：2秒内最多触发一次
      
      const handleScroll = () => {
        const now = Date.now()
        if (now - lastScrollTime < SCROLL_THROTTLE) {
          return // 节流：避免过于频繁的滚动检测
        }
        
        if (scrollTimer) clearTimeout(scrollTimer)
        scrollTimer = setTimeout(() => {
          debug("LinkQRInjector: 滚动触发内容检查")
          hasRecentActivity = true // 标记有用户活动
          // 不立即执行 processAll，而是等待下次定时扫描
          lastScrollTime = now
        }, 1500) // 滚动停止1.5秒后标记活动
      }

      // 监听滚动事件（性能优化版本）
      window.addEventListener("scroll", handleScroll, { passive: true })

      // 性能优化的点击事件检测
      let clickTimer: NodeJS.Timeout | undefined
      let lastClickTime = 0
      const CLICK_THROTTLE = 3000 // 点击节流：3秒内最多触发一次
      
      const handleClick = (e: Event) => {
        const now = Date.now()
        if (now - lastClickTime < CLICK_THROTTLE) {
          return // 节流：避免频繁的点击检测
        }
        
        const target = e.target as Element
        if (!target) return

        // 优化的选择器检查：只检查最可能的触发元素
        const quickCheck = target.tagName === 'BUTTON' || 
                          target.classList.contains('btn') ||
                          target.classList.contains('button')
        
        if (!quickCheck) {
          // 如果不是明显的按钮，进行更详细但开销更大的检查
          const detailedSelectors = [
            '[class*="more"]',
            '[class*="load"]',
            '[class*="show"]',
            '[class*="expand"]'
          ]
          
          const needsDetailedCheck = detailedSelectors.some(selector => {
            try {
              return target.matches(selector)
            } catch {
              return false
            }
          })
          
          if (!needsDetailedCheck) return
        }

        if (clickTimer) clearTimeout(clickTimer)
        clickTimer = setTimeout(() => {
          debug("LinkQRInjector: 检测到动态内容触发点击")
          hasRecentActivity = true // 标记有用户活动，等待下次定时扫描
          lastClickTime = now
        }, 2000) // 点击后2秒标记活动
      }

      document.addEventListener("click", handleClick, { passive: true })

      // 清理函数
      return () => {
        if (timeoutId) clearTimeout(timeoutId)
        if (scrollTimer) clearTimeout(scrollTimer)
        if (clickTimer) clearTimeout(clickTimer)
        observer?.disconnect()
        clearInterval(intervalId)
        window.removeEventListener("scroll", handleScroll)
        document.removeEventListener("click", handleClick)
        cleanupQRIcons()
      }
    } else {
      // 如果功能被禁用，清理所有图标
      cleanupQRIcons()

      return () => {
        cleanupQRIcons()
      }
    }
  }, [enabled, onGenerateQR])

  // 这个组件不渲染任何内容，只是用来处理DOM
  return null
}
