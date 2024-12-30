import { Expand, Shrink } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"

import { Button } from "../ui/button"

export function FullScreen(props: any) {
  const { children, right = 10, top = 10, ...rest } = props
  const ref = useRef<HTMLDivElement>()
  const [fullScreen, setFullScreen] = useState(false)
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      ref.current?.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
  }, [])
  useEffect(() => {
    const handleScreenChange = (e: any) => {
      if (e.target === ref.current) {
        setFullScreen(!!document.fullscreenElement)
      }
    }
    document.addEventListener("fullscreenchange", handleScreenChange)
    return () => {
      document.removeEventListener("fullscreenchange", handleScreenChange)
    }
  }, [])
  return (
    <div ref={ref} style={{ position: "relative" }} {...rest}>
      <div style={{ position: "absolute", right, top }}>
        <Button className="size-8" onClick={toggleFullscreen}>
          {fullScreen ? (
            <Shrink className="size-4" />
          ) : (
            <Expand className="size-4" />
          )}
        </Button>
      </div>
      {children}
    </div>
  )
}
