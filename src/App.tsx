import { useState, useEffect } from 'react'
import { Sun, Moon } from 'lucide-react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  rectSortingStrategy,
} from '@dnd-kit/sortable'
import WeatherCard from './components/WeatherCard'
import TrainStatusCard from './components/TrainStatusCard'
import NewsCard from './components/NewsCard'
import AnniversaryCard from './components/AnniversaryCard'
import QuoteCard from './components/QuoteCard'
import SortableCard from './components/SortableCard'

// カードのメタデータ
interface CardMeta {
  id: string
  colSpan: number
}

function App() {
  const [isDark, setIsDark] = useState(false)

  // デフォルトのカード順序（IDのみ）
  const defaultCardOrder = ['weather', 'train', 'anniversary', 'quote', 'news']

  // カードの順序を管理
  const [cardOrder, setCardOrder] = useState<string[]>(() => {
    // LocalStorageから順序を復元
    const savedOrder = localStorage.getItem('cardOrder')
    if (savedOrder) {
      try {
        return JSON.parse(savedOrder) as string[]
      } catch (e) {
        console.error('カード順序の復元に失敗:', e)
        return defaultCardOrder
      }
    }
    return defaultCardOrder
  })

  // IDからコンポーネントを返す関数
  const renderCard = (id: string) => {
    switch (id) {
      case 'weather':
        return <WeatherCard />
      case 'train':
        return <TrainStatusCard />
      case 'anniversary':
        return <AnniversaryCard />
      case 'quote':
        return <QuoteCard />
      case 'news':
        return <NewsCard />
      default:
        return null
    }
  }

  // カードのcolSpanを返す
  const getColSpan = (id: string): number => {
    return id === 'news' ? 2 : 1
  }

  useEffect(() => {
    // ダークモードの初期設定
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    setIsDark(prefersDark)
    if (prefersDark) {
      document.documentElement.classList.add('dark')
    }
  }, [])

  const toggleDarkMode = () => {
    setIsDark(!isDark)
    document.documentElement.classList.toggle('dark')
  }

  // 現在の時刻から挨拶を変更
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 5) return 'おやすみなさい'
    if (hour < 12) return 'おはようございます'
    if (hour < 18) return 'こんにちは'
    return 'こんばんは'
  }

  // ドラッグ&ドロップのセンサー設定
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px移動したらドラッグ開始
      },
    })
  )

  // ドラッグ終了時の処理
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setCardOrder((items) => {
        const oldIndex = items.indexOf(active.id as string)
        const newIndex = items.indexOf(over.id as string)

        const newOrder = arrayMove(items, oldIndex, newIndex)

        // LocalStorageに保存
        localStorage.setItem('cardOrder', JSON.stringify(newOrder))
        console.log('カード順序を保存:', newOrder)

        return newOrder
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-slate-800 dark:to-blue-950 transition-colors duration-500">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* ヘッダー */}
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-800 dark:text-gray-100 mb-2">
              {getGreeting()}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {new Date().toLocaleDateString('ja-JP', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'long'
              })}
            </p>
          </div>
          <button
            onClick={toggleDarkMode}
            className="p-3 rounded-full bg-white dark:bg-gray-700 shadow-lg hover:shadow-xl transition-all hover:scale-105"
            aria-label="ダークモード切り替え"
          >
            {isDark ? (
              <Sun className="w-6 h-6 text-yellow-400" />
            ) : (
              <Moon className="w-6 h-6 text-gray-700" />
            )}
          </button>
        </header>

        {/* メインコンテンツ */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={cardOrder}
            strategy={rectSortingStrategy}
          >
            <div className="grid gap-6 md:grid-cols-2">
              {cardOrder.map((cardId) => {
                const colSpan = getColSpan(cardId)
                return (
                  <div
                    key={cardId}
                    className={colSpan === 2 ? 'md:col-span-2' : ''}
                  >
                    <SortableCard id={cardId}>
                      {renderCard(cardId)}
                    </SortableCard>
                  </div>
                )
              })}
            </div>
          </SortableContext>
        </DndContext>

        {/* フッター */}
        <footer className="mt-12 text-center text-gray-500 dark:text-gray-400 text-sm">
          <p>朝のダッシュボード - あなたの1日を快適にスタート</p>
        </footer>
      </div>
    </div>
  )
}

export default App
