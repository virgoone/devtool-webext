import ReactDOM from "react-dom/client";
import "~/assets/tailwind.css";
import { debug } from '@/utils/debug'
import { updateReference } from "./reference";
import { App } from "./app";

export default defineContentScript({
  matches: ["<all_urls>"],
  cssInjectionMode: "ui",
  allFrames: true,
  async main(ctx) {
    let observer: MutationObserver;
    await createShadowRootUi(ctx, {
      name: "devtool-extension",
      anchor: "html",
      position: "overlay",
      zIndex: 2147483647,
      isolateEvents: true,
      onMount: (uiContainer: HTMLElement, shadow: ShadowRoot) => {
        if (window.top !== window && document.querySelector('#devtool-extension-root')) {
          console.log('Extension already exists in this frame');
          return;
        }
        // 处理单个样式元素
        const processStyle = (style: HTMLStyleElement) => {
          if (!style.textContent?.includes('rem')) return;

          debug('Processing style:', style.textContent.slice(0, 100));

          // 创建新的样式内容
          const newContent = style.textContent.replace(
            // 更精确的 rem 匹配模式
            /(?<=:[\s]*|[\s])-?[\d.]+rem/g,
            match => {
              const value = parseFloat(match);
              return `${value * 16}px`;
            }
          );

          // 只有当内容确实改变时才替换
          if (newContent !== style.textContent) {
            const newStyle = document.createElement('style');
            newStyle.textContent = newContent;
            style.replaceWith(newStyle);
          }
        };

        // 处理所有样式
        const processAllStyles = () => {
          // 获取所有样式元素
          const allStyles = shadow.querySelectorAll('style');
          debug('Found styles:', allStyles.length);

          allStyles.forEach(style => {
            if (style instanceof HTMLStyleElement) {
              processStyle(style);
            }
          });
        };

        // 创建观察器
        observer = new MutationObserver((mutations) => {
          const hostFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
          const scaleFactor = hostFontSize / 16;
          debug('Scale factor:', scaleFactor);
          if (scaleFactor > 1) {
            processAllStyles();
          }
        });

        // 开始观察
        observer.observe(document.documentElement, {
          attributes: true,
        });

        updateReference(shadow);
        // 修正样式(sonner组件的样式会被注入到head中，将其移动到shadow之中)
        const style = Array.from(document.head.querySelectorAll("style")).filter(o => o.textContent?.includes("data-sonner-toaster"))?.[0];
        shadow.head.appendChild(style);
        const wrapper = document.createElement("div");
        wrapper.id = "devtool-extension-root";
        uiContainer.append(wrapper);

        const root = ReactDOM.createRoot(wrapper);
        root.render(<App />);

        return {
          root,
          wrapper
        };
      },
      onRemove: (elements) => {
        elements?.root.unmount();
        elements?.wrapper.remove();
        observer?.disconnect();
      }
    }).then(ui => ui.mount());
  },
});
