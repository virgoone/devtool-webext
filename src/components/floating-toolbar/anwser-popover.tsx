"use client"

import { Copy, Volume2, X } from "lucide-react"
import * as React from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover"

interface AnswerPopoverProps {
  trigger: React.ReactNode
  title?: string
  content: string
  quote?: string
  author: {
    name: string
    avatar: string
  }
}

export default function AnswerPopover({
  trigger,
  title = "回答此问题",
  content,
  quote,
  author
}: AnswerPopoverProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent
        className="w-[400px] p-0 gap-0 rounded-xl shadow-2xl"
        align="start">
        <div className="p-4 flex flex-row items-center justify-between">
          <h2 className="text-sm font-medium">{title}</h2>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="p-4 space-y-3">
          {quote && (
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-600 leading-relaxed">{quote}</p>
            </div>
          )}
          <p className="text-sm text-gray-600 leading-relaxed">{content}</p>
        </div>
        <div className="border-t p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={author.avatar} alt={author.name} />
              <AvatarFallback>{author.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">{author.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Volume2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
