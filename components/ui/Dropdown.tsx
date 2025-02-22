'use client'

import * as React from 'react'
import { createPortal } from 'react-dom'

interface DropdownProps {
  isOpen: boolean
  onClose: () => void
  trigger: React.ReactNode
  children: React.ReactNode
}

export function Dropdown({ isOpen, onClose, trigger, children }: DropdownProps) {
  const [mounted, setMounted] = React.useState(false)
  const triggerRef = React.useRef<HTMLDivElement>(null)
  const dropdownRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    setMounted(true)
    
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  React.useEffect(() => {
    if (isOpen && dropdownRef.current && triggerRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect()
      dropdownRef.current.style.top = `${triggerRect.bottom + window.scrollY}px`
      dropdownRef.current.style.left = `${triggerRect.left + window.scrollX}px`
      dropdownRef.current.style.width = `${triggerRect.width}px`
    }
  }, [isOpen])

  return (
    <>
      <div ref={triggerRef}>{trigger}</div>
      {mounted && isOpen
        ? createPortal(
            <div
              ref={dropdownRef}
              className="fixed z-50 mt-1 bg-transparent-white backdrop-blur-sm border border-accent/30 rounded-md shadow-lg max-h-[400px] overflow-y-auto scrollbar-thin"
              style={{ maxWidth: '100vw' }}
            >
              {children}
            </div>,
            document.body
          )
        : null}
    </>
  )
}

