import { useState, useEffect } from 'react'
import { Sun, Moon, Image as ImageIcon } from 'lucide-react'
import { logger } from './utils/logger'
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
import TodoCard from './components/TodoCard'
import LocationSettingsCard from './components/LocationSettingsCard'
import ClockTimerCard from './components/ClockTimerCard'
import SortableCard from './components/SortableCard'
import { useBackgroundImage } from './hooks/useBackgroundImage'
import { useLocation } from './hooks/useLocation'

function App() {
  // ダークモードの状態をLocalStorageから復元
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('darkMode')
    if (saved !== null) {
      return JSON.parse(saved)
    }
    // 保存がない場合はシステム設定を使用
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  const [useBackground, setUseBackground] = useState(() => {
    // LocalStorageから背景画像の使用設定を取得
    const saved = localStorage.getItem('useBackgroundImage')
    return saved !== null ? JSON.parse(saved) : true // デフォルトはtrue
  })

  // 背景画像を取得
  const { imageUrl, loading: bgLoading } = useBackgroundImage()

  // 位置情報管理
  const {
    locations,
    currentLocation,
    setCurrentLocation,
    addLocation,
    removeLocation,
    getCurrentPosition,
    isLoadingGeo
  } = useLocation()

  // デフォルトのカード順序（IDのみ）
  const defaultCardOrder = ['weather', 'clock', 'train', 'todo', 'location', 'anniversary', 'quote', 'news']

  // カードの順序を管理
  const [cardOrder, setCardOrder] = useState<string[]>(() => {
    // LocalStorageから順序を復元
    const savedOrder = localStorage.getItem('cardOrder')
    if (savedOrder) {
      try {
        return JSON.parse(savedOrder) as string[]
      } catch (e) {
        logger.error('カード順序の復元に失敗:', e)
        return defaultCardOrder
      }
    }
    return defaultCardOrder
  })

  // IDからコンポーネントを返す関数
  const renderCard = (id: string) => {
    switch (id) {
      case 'weather':
        return (
          <WeatherCard
            latitude={currentLocation?.latitude}
            longitude={currentLocation?.longitude}
            locationName={currentLocation?.name}
            locations={locations}
            onSetCurrentLocation={setCurrentLocation}
          />
        )
      case 'clock':
        return <ClockTimerCard />
      case 'train':
        return <TrainStatusCard />
      case 'todo':
        return <TodoCard />
      case 'location':
        return (
          <LocationSettingsCard
            locations={locations}
            currentLocation={currentLocation}
            onSetCurrentLocation={setCurrentLocation}
            onAddLocation={addLocation}
            onRemoveLocation={removeLocation}
            onGetCurrentPosition={getCurrentPosition}
            isLoadingGeo={isLoadingGeo}
          />
        )
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
    // ダークモードの初期設定: LocalStorageの値に基づいてクラスを設定
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [])

  const toggleDarkMode = () => {
    const newValue = !isDark
    setIsDark(newValue)

    // DOMクラスを更新
    if (newValue) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }

    // LocalStorageに保存
    localStorage.setItem('darkMode', JSON.stringify(newValue))
  }

  const toggleBackground = () => {
    const newValue = !useBackground
    setUseBackground(newValue)
    localStorage.setItem('useBackgroundImage', JSON.stringify(newValue))
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
        logger.log('カード順序を保存:', newOrder)

        return newOrder
      })
    }
  }

  return (
    <div
      className="min-h-screen transition-all duration-500 relative"
      style={{
        background: useBackground && imageUrl
          ? 'transparent'
          : isDark
            ? 'linear-gradient(to bottom right, rgb(17, 24, 39), rgb(30, 41, 59), rgb(23, 37, 84))'
            : 'linear-gradient(to bottom right, rgb(255, 237, 213), rgb(252, 231, 243), rgb(219, 234, 254))'
      }}
    >
      {/* 背景画像 */}
      {useBackground && imageUrl && (
        <>
          <div
            className="fixed inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000"
            style={{
              backgroundImage: `url(${imageUrl})`,
              opacity: bgLoading ? 0 : 1
            }}
          />
          {/* オーバーレイ（コンテンツを見やすくするため） */}
          <div className="fixed inset-0 bg-black/30 dark:bg-black/50" />
        </>
      )}

      <div className="container mx-auto px-4 py-8 max-w-4xl relative z-10">
        {/* ヘッダー */}
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-800 dark:text-gray-100 mb-2 drop-shadow-lg">
              {getGreeting()}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 drop-shadow-md">
              {new Date().toLocaleDateString('ja-JP', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'long'
              })}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={toggleBackground}
              className="p-3 rounded-full bg-white dark:bg-gray-700 shadow-lg hover:shadow-xl transition-all hover:scale-105"
              aria-label="背景画像切り替え"
              title={useBackground ? '背景画像をオフ' : '背景画像をオン'}
            >
              <ImageIcon
                className={`w-6 h-6 ${
                  useBackground
                    ? 'text-blue-500 dark:text-blue-400'
                    : 'text-gray-400 dark:text-gray-500'
                }`}
              />
            </button>
            <button
              onClick={toggleDarkMode}
              className="p-3 rounded-full bg-white dark:bg-gray-700 shadow-lg hover:shadow-xl transition-all hover:scale-105"
              aria-label={isDark ? 'ライトモードに切り替え' : 'ダークモードに切り替え'}
              aria-pressed={isDark}
              title={isDark ? 'ライトモードに切り替え' : 'ダークモードに切り替え'}
            >
              {isDark ? (
                <Sun className="w-6 h-6 text-yellow-400" />
              ) : (
                <Moon className="w-6 h-6 text-gray-700" />
              )}
            </button>
          </div>
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
