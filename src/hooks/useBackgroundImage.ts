import { useState, useEffect } from 'react'

interface BackgroundImageState {
  imageUrl: string | null
  loading: boolean
  error: string | null
}

/**
 * 毎日変わる背景画像を管理するカスタムフック
 * LocalStorageで日付ごとにキャッシュし、同じ日は同じ画像を表示
 */
export function useBackgroundImage() {
  const [state, setState] = useState<BackgroundImageState>({
    imageUrl: null,
    loading: true,
    error: null
  })

  useEffect(() => {
    const fetchBackgroundImage = async () => {
      try {
        // 今日の日付をキーとして使用
        const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD

        // LocalStorageから今日の画像URLを取得
        const cachedData = localStorage.getItem('backgroundImage')
        if (cachedData) {
          const parsed = JSON.parse(cachedData)
          // 同じ日付なら、キャッシュされた画像を使用
          if (parsed.date === today) {
            setState({
              imageUrl: parsed.url,
              loading: false,
              error: null
            })
            return
          }
        }

        // 新しい画像を取得（Unsplash Source API）
        // ランダムシードとして日付を使用することで、同じ日は同じ画像になる
        const imageUrl = `https://source.unsplash.com/1920x1080/?morning,sunrise,nature&sig=${today}`

        // 画像が読み込まれるまで待機
        const img = new Image()
        img.onload = () => {
          // LocalStorageに保存
          localStorage.setItem('backgroundImage', JSON.stringify({
            date: today,
            url: imageUrl
          }))

          setState({
            imageUrl,
            loading: false,
            error: null
          })
        }

        img.onerror = () => {
          console.error('背景画像の読み込みに失敗しました')
          setState({
            imageUrl: null,
            loading: false,
            error: '画像を読み込めませんでした'
          })
        }

        img.src = imageUrl
      } catch (err) {
        console.error('背景画像の取得に失敗しました:', err)
        setState({
          imageUrl: null,
          loading: false,
          error: '画像を取得できませんでした'
        })
      }
    }

    fetchBackgroundImage()
  }, [])

  return state
}
