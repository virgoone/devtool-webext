"use client"

import { Pause, Play, X } from "lucide-react"
import React, { useEffect, useRef, useState } from "react"

import VoiceRobot from "@/assets/voice-robot.png"
import { Button } from "@/components/ui/button"

import Highlighter from "./highlighter" // 确保路径正确

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
  const selectionRange = useRef<Range | null>(null)
  const highlighterRef = useRef<Highlighter | null>(null)

  useEffect(() => {
    // 初始化 Highlighter
    if (!highlighterRef.current) {
      highlighterRef.current = new Highlighter({
        sentenceColor: "rgba(122, 89, 255, 0.08)", // 黄色高亮
        wordColor: "rgba(122, 89, 255, 0.16)" // 黄色高亮
      })
    }

    // 当组件卸载时，确保停止语音合成并清除高亮
    return () => {
      if (isSpeaking) {
        window.speechSynthesis.cancel()
        resetHighlight()
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

        // 确保在用户选择的范围内操作
        if (selectionRange.current) {
          const startContainer = selectionRange.current.startContainer
          const endContainer = selectionRange.current.endContainer

          // 创建一个新的 Range
          const range = document.createRange()

          // 计算相对开始位置
          const relativeStart = Math.max(
            0,
            charIndex - selectionRange.current.startOffset
          )
          const relativeEnd = Math.min(
            selectionRange.current.endOffset -
              selectionRange.current.startOffset,
            relativeStart + event.charLength
          )

          // 设置范围
          range.setStart(
            startContainer,
            Math.min(relativeStart, startContainer.textContent?.length || 0)
          )
          range.setEnd(
            endContainer,
            Math.min(relativeEnd, endContainer.textContent?.length || 0)
          )

          // 使用 Highlighter 高亮
          const container =
            selectionRange.current.commonAncestorContainer.parentElement ||
            document.body
          highlighterRef.current?.highlightSentence({
            text: text.trim(),
            container: container,
            range: range
          })
          // 高亮单词
          highlighterRef.current?.highlightWord(
            relativeStart,
            relativeEnd - relativeStart
          )
        }
      }
      utterance.onend = () => {
        setIsSpeaking(false)
        resetHighlight()
      }

      utterance.onerror = () => {
        setIsSpeaking(false)
        resetHighlight()
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
      resetHighlight()
    }
  }

  const toolbarStyle: React.CSSProperties = {
    position: "fixed",
    top: `${position.y}px`,
    left: `${position.x}px`,
    transform: "translate(-50%, -50%)",
    zIndex: 1000
  }

  const resetHighlight = () => {
    // 清除高亮
    highlighterRef.current?.clear()
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
      <img
        src={VoiceRobot}
        alt="Voice robot"
        className="h-8 w-8 rounded-full"
      />
      <Button
        onClick={handleSpeak}
        disabled={isSpeaking}
        variant="ghost"
        size="icon"
        className={`h-8 w-8 ${isSpeaking ? "bg-green-500 hover:bg-green-600 text-white" : "bg-gray-400 cursor-not-allowed"}`}>
        {isSpeaking ? (
          <Pause className="size-4" />
        ) : (
          <Play className="size-4" />
        )}
      </Button>
      <Button variant="ghost" onClick={handleClose} className="ml-2">
        <X className="h-4 w-4" />
      </Button>
    </div>
  )
}

export default PlaybackToolbar
