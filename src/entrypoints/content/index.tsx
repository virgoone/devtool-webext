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
        updateReference(shadow);
        // 修正样式(sonner组件的样式会被注入到head中，将其移动到shadow之中)
        const style = Array.from(document.head.querySelectorAll("style")).filter(o => o.textContent?.includes("data-sonner-toaster"))?.[0];
        shadow.head.appendChild(style);
        const wrapper = document.createElement("div");
        wrapper.id = "devtool-extension-root";
        uiContainer.append(wrapper);
        const root = ReactDOM.createRoot(wrapper);
        root.render(<App />);
        return { root, wrapper };
      },
      onRemove: (elements) => {
        elements?.root.unmount();
        elements?.wrapper.remove();
      }
    }).then(ui => ui.mount());
  },
});
