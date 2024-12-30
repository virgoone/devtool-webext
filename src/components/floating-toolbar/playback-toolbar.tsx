"use client"

import { Pause, Play, X } from "lucide-react"
import React, { useEffect, useRef, useState } from "react"

import VoiceRobot from "@/assets/voice-robot.png"
import { Button } from "@/components/ui/button"

interface PlaybackToolbarProps {
  text: string
  position: { x: number; y: number }
  visible: boolean
  onClose: () => void
}

const PlaybackToolbar: React.FC<PlaybackToolbarProps> = ({
  visible,
  text,
  position,
  onClose
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [highlightedText, setHighlightedText] = useState("")
  const [highlightedRange, setHighlightedRange] = useState<{
    start: number
    end: number
  }>({ start: 0, end: 0 }) // 用于高亮朗读的文本
  const selectionRange = useRef<Range | null>(null)

  useEffect(() => {
    // 当组件卸载时，确保停止语音合成
    return () => {
      if (isSpeaking) {
        window.speechSynthesis.cancel()
      }
    }
  }, [isSpeaking])

  const handleSpeak = () => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      window.speechSynthesis.speak(utterance)
      setIsSpeaking(true)

      utterance.onboundary = (event) => {
        const charIndex = event.charIndex
        const endIndex = charIndex + event.charLength
        setHighlightedRange({ start: charIndex, end: endIndex })
      }

      utterance.onend = () => {
        setIsSpeaking(false)
        setHighlightedRange({ start: 0, end: 0 })
      }

      utterance.onerror = () => {
        setIsSpeaking(false)
        setHighlightedRange({ start: 0, end: 0 })
      }
    } else {
      console.error("Speech synthesis is not supported in this browser.")
    }
  }

  const handleClose = () => {
    onClose()
    if (isSpeaking) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
      setHighlightedRange({ start: 0, end: 0 })
    }
  }

  const toolbarStyle: React.CSSProperties = {
    position: "fixed",
    top: `${position.y}px`,
    left: `${position.x}px`,
    transform: "translate(-50%, -50%)",
    zIndex: 1000
  }

  const highlightText = (
    text: string,
    highlightRange: { start: number; end: number }
  ) => {
    const parts = []
    let currentIndex = 0

    if (highlightRange.start > 0) {
      parts.push(text.slice(0, highlightRange.start))
      currentIndex = highlightRange.start
    }

    if (highlightRange.start < highlightRange.end) {
      parts.push(
        <span key="highlighted" className="bg-yellow-300">
          {text.slice(highlightRange.start, highlightRange.end)}
        </span>
      )
      currentIndex = highlightRange.end
    }

    if (currentIndex < text.length) {
      parts.push(text.slice(currentIndex))
    }

    return <>{parts}</>
  }

  useEffect(() => {
    const selection = window.getSelection()
    if (selection?.rangeCount && selection.rangeCount > 0) {
      selectionRange.current = selection.getRangeAt(0)
    }
  }, [text])

  if (!visible) return null

  return (
    <div
      style={toolbarStyle}
      className="fixed z-[2147483647] flex items-center gap-1 p-1 bg-white rounded-lg shadow-lg">
      <img src={VoiceRobot} alt="Voice robot" className="h-8 w-8 rounded-full" />
      <Button
        onClick={handleSpeak}
        disabled={isSpeaking}
        variant="ghost"
        size="icon"
        className={cn("h-8 w-8", {
          "bg-gray-400 cursor-not-allowed": !isSpeaking,
          "bg-green-500 hover:bg-green-600 text-white": isSpeaking
        })}>
        {isSpeaking ? (
          <Pause className="size-4" />
        ) : (
          <Play className="size-4" />
        )}
      </Button>
      <Button variant="ghost" onClick={handleClose} className="ml-2">
        <X className="h-4 w-4" />
      </Button>
      {isSpeaking && selectionRange.current && (
        <div className="ml-2 text-sm">
          {highlightText(text, highlightedRange)}
        </div>
      )}
    </div>
  )
}

export default PlaybackToolbar
