export function Header() {
  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-20">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">🧮</span>
            <h1 className="text-2xl font-display font-bold text-blue-600">EasyMath</h1>
          </div>

          <nav className="hidden md:flex items-center space-x-6">
            <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">
              Home
            </a>
            <span className="text-gray-400">/</span>
            <span className="text-blue-600 font-medium">Number Sense - Kids Math Games</span>
          </nav>
        </div>
      </div>
    </header>
  )
}
