import { RefreshCw } from "lucide-react"
import { nanoid } from "nanoid"
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState
} from "react"

import styles from "./artifacts.module.less"

type HTMLPreviewProps = {
  code: string
  autoHeight?: boolean
  height?: number | string
  onLoad?: (title?: string) => void
}

export type HTMLPreviewHander = {
  reload: () => void
}

export const HTMLPreview = forwardRef<HTMLPreviewHander, HTMLPreviewProps>(
  function HTMLPreview(props, ref) {
    const iframeRef = useRef<HTMLIFrameElement>(null)
    const [frameId, setFrameId] = useState<string>(nanoid())
    const [iframeHeight, setIframeHeight] = useState(600)
    const [title, setTitle] = useState("")
    /*
     * https://stackoverflow.com/questions/19739001/what-is-the-difference-between-srcdoc-and-src-datatext-html-in-an
     * 1. using srcdoc
     * 2. using src with dataurl:
     *    easy to share
     *    length limit (Data URIs cannot be larger than 32,768 characters.)
     */

    useEffect(() => {
      const handleMessage = (e: any) => {
        const { id, height, title } = e.data
        setTitle(title)
        if (id == frameId) {
          setIframeHeight(height)
        }
      }
      window.addEventListener("message", handleMessage)
      return () => {
        window.removeEventListener("message", handleMessage)
      }
    }, [frameId])

    useImperativeHandle(ref, () => ({
      reload: () => {
        setFrameId(nanoid())
      }
    }))

    const height = useMemo(() => {
      if (!props.autoHeight) return props.height || 600
      if (typeof props.height === "string") {
        return props.height
      }
      const parentHeight = props.height || 600
      return iframeHeight + 40 > parentHeight ? parentHeight : iframeHeight + 40
    }, [props.autoHeight, props.height, iframeHeight])

    const srcDoc = useMemo(() => {
      const script = `<script>window.addEventListener("DOMContentLoaded", () => new ResizeObserver((entries) => parent.postMessage({id: '${frameId}', height: entries[0].target.clientHeight}, '*')).observe(document.body))</script>`
      if (props.code.includes("<!DOCTYPE html>")) {
        props.code.replace("<!DOCTYPE html>", "<!DOCTYPE html>" + script)
      }
      return script + props.code
    }, [props.code, frameId])

    const handleOnLoad = () => {
      if (props?.onLoad) {
        props.onLoad(title)
      }
    }

    return (
      <iframe
        className={styles["artifacts-iframe"]}
        key={frameId}
        ref={iframeRef}
        sandbox="allow-forms allow-modals allow-scripts"
        style={{ height }}
        srcDoc={srcDoc}
        onLoad={handleOnLoad}
      />
    )
  }
)

// export function Artifacts() {
//   const { id } = useParams()
//   const [code, setCode] = useState("")
//   const [loading, setLoading] = useState(true)
//   const [fileName, setFileName] = useState("")
//   const previewRef = useRef<HTMLPreviewHander>(null)

//   useEffect(() => {
//     if (id) {
//       fetch(`${ApiPath.Artifacts}?id=${id}`)
//         .then((res) => {
//           if (res.status > 300) {
//             throw Error("can not get content")
//           }
//           return res
//         })
//         .then((res) => res.text())
//         .then(setCode)
//         .catch((e) => {
//           showToast(Locale.Export.Artifacts.Error)
//         })
//     }
//   }, [id])

//   return (
//     <div className={styles["artifacts"]}>
//       <div className={styles["artifacts-header"]}>
//         <Button
//           variant="ghost"
//           size="icon"
//           className="size-8"
//           style={{ marginLeft: 20 }}
//           onClick={() => previewRef.current?.reload()}>
//           <RefreshCw className="size-4" />
//         </Button>
//         <div className={styles["artifacts-title"]}>NextChat Artifacts</div>
//       </div>
//       <div className={styles["artifacts-content"]}>
//         {loading && <Loading />}
//         {code && (
//           <HTMLPreview
//             code={code}
//             ref={previewRef}
//             autoHeight={false}
//             height={"100%"}
//             onLoad={(title) => {
//               setFileName(title as string)
//               setLoading(false)
//             }}
//           />
//         )}
//       </div>
//     </div>
//   )
// }
