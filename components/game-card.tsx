import Link from 'next/link'

interface GameCategory {
  id: string
  title: string
  description: string
  icon: string
  color: string
  bgColor: string
  borderColor: string
  games: Array<{ name: string; icon: string; href: string }>
}

interface GameCardProps {
  category: GameCategory
  delay: number
}

export function GameCard({ category, delay }: GameCardProps) {
  return (
    <div
      className={`game-card ${category.bgColor} ${category.borderColor} border-2 rounded-3xl p-8 text-center shadow-lg hover:shadow-2xl`}
      style={{ animationDelay: `${delay}s` }}
    >
      {/* 图标 */}
      <div className="mb-6">
        <div
          className={`w-20 h-20 mx-auto rounded-full bg-gradient-to-r ${category.color} flex items-center justify-center text-3xl shadow-lg float`}
        >
          {category.icon}
        </div>
      </div>

      {/* 标题和描述 */}
      <h3 className="text-2xl font-display font-bold text-gray-800 mb-4">{category.title}</h3>
      <p className="text-gray-600 mb-8 leading-relaxed">{category.description}</p>

      {/* 游戏按钮 */}
      <div className="space-y-3">
        {category.games.map((game) => (
          <Link
            href={game.href}
            key={game.name}
            className={`game-button w-full bg-gradient-to-r ${category.color} text-white py-3 px-6 rounded-full font-semibold shadow-md hover:shadow-lg flex items-center justify-center space-x-2 transition duration-200 hover:scale-[1.02]`}
          >
            <span className="text-lg">{game.icon}</span>
            <span>{game.name}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
