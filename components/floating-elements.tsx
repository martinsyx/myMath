type FloatingElement = {
  emoji: string
  size: string
  position: {
    top?: string
    bottom?: string
    left?: string
    right?: string
  }
  delay: string
}

export function FloatingElements() {
  const elements: FloatingElement[] = [
    {
      emoji: "🌟",
      size: "text-2xl",
      position: { top: "5rem", left: "2.5rem" },
      delay: "0s",
    },
    {
      emoji: "🎈",
      size: "text-3xl",
      position: { top: "8rem", right: "4rem" },
      delay: "1s",
    },
    {
      emoji: "🌈",
      size: "text-2xl",
      position: { top: "16rem", left: "25%" },
      delay: "2s",
    },
    {
      emoji: "✨",
      size: "text-xl",
      position: { top: "20rem", right: "33.333%" },
      delay: "0.5s",
    },
    {
      emoji: "🎨",
      size: "text-2xl",
      position: { bottom: "8rem", left: "4rem" },
      delay: "1.5s",
    },
    {
      emoji: "🚀",
      size: "text-3xl",
      position: { bottom: "12rem", right: "5rem" },
      delay: "2.5s",
    },
  ]

  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      {elements.map((element, index) => (
        <div
          key={index}
          className={`absolute ${element.size} opacity-20 float`}
          style={{ animationDelay: element.delay, ...element.position }}
        >
          {element.emoji}
        </div>
      ))}
    </div>
  )
}
