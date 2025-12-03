import type React from "react"

interface AdditionLayoutShellProps {
  children: React.ReactNode
}

export function AdditionLayoutShell({ children }: AdditionLayoutShellProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6">{children}</div>
        </div>
      </div>
    </div>
  )
}
