export function FloatingElements() {
  const elements = [
    { emoji: "🌟", size: "text-2xl", position: "top-20 left-10", delay: "0s" },
    { emoji: "🎈", size: "text-3xl", position: "top-32 right-16", delay: "1s" },
    { emoji: "🌈", size: "text-2xl", position: "top-64 left-1/4", delay: "2s" },
    { emoji: "⭐", size: "text-xl", position: "top-80 right-1/3", delay: "0.5s" },
    { emoji: "🎨", size: "text-2xl", position: "bottom-32 left-16", delay: "1.5s" },
    { emoji: "🚀", size: "text-3xl", position: "bottom-48 right-20", delay: "2.5s" },
  ]

  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      {elements.map((element, index) => (
        <div
          key={index}
          className={`absolute ${element.position} ${element.size} opacity-20 float`}
          style={{ animationDelay: element.delay }}
        >
          {element.emoji}
        </div>
      ))}
    </div>
  )
}
