import type React from "react"
import "../addition/globals.css"
import { AdditionLayoutShell } from "@/components/addition/AdditionLayoutShell"

interface HomeLayoutProps {
  children: React.ReactNode
}

export default function HomeLayout({ children }: HomeLayoutProps) {
  return <AdditionLayoutShell>{children}</AdditionLayoutShell>
}
