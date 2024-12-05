import ReactDOM from "react-dom/client";
import "~/assets/tailwind.css";
import { updateReference } from "./reference";
import { App } from "./app";

export default defineContentScript({
  matches: ["<all_urls>"],
  cssInjectionMode: "ui",
  allFrames: true,
  async main(ctx) {
    await createShadowRootUi(ctx, {
      name: "devtool-extension",
      anchor: "html",
      position: "overlay",
      zIndex: 2147483647,
      isolateEvents: true,
      onMount: (uiContainer: HTMLElement, shadow: ShadowRoot) => {
        const hostFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
        const scaleFactor = hostFontSize / 16;

        if (scaleFactor > 1) {
          requestAnimationFrame(() => {
            const styles = Array.from(shadow.querySelectorAll('style'));

            // 找到 tailwind 的样式
            const tailwindStyle = styles.find(style =>
              style.textContent?.includes('tailwind') ||
              style.textContent?.includes('text-') ||
              style.textContent?.includes('p-') ||
              style.textContent?.includes('m-')
            );

            if (tailwindStyle && tailwindStyle.textContent) {
              const newStyle = document.createElement('style');

              // 替换所有的 rem 为 px
              newStyle.textContent = tailwindStyle.textContent.replace(
                /(\d*\.?\d+)rem/g,
                (match, value) => `${parseFloat(value) * 16}px`
              );
              tailwindStyle.replaceWith(newStyle);
            }
          });
        }

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
      }
    }).then(ui => ui.mount());
  },
});
