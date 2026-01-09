import { useState, useEffect } from 'react'
import { logger } from '../utils/logger'

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

        // 新しい画像を取得
        let imageUrl: string

        // Unsplash APIキーが設定されている場合は公式APIを使用
        const unsplashAccessKey = import.meta.env.VITE_UNSPLASH_ACCESS_KEY || ""

        if (unsplashAccessKey) {
          // Unsplash API（高品質な朝の画像）
          try {
            const response = await fetch(
              `https://api.unsplash.com/photos/random?query=morning,sunrise,nature&orientation=landscape&w=1920&h=1080`,
              {
                headers: {
                  Authorization: `Client-ID ${unsplashAccessKey}`
                }
              }
            )
            const data = await response.json()
            imageUrl = data.urls.regular
          } catch (err) {
            logger.warn('Unsplash API失敗、Picsumにフォールバック:', err)
            // フォールバック: Picsum Photos
            const seed = today.replace(/-/g, '')
            imageUrl = `https://picsum.photos/seed/${seed}/1920/1080`
          }
        } else {
          // Unsplash APIキーがない場合はPicsum Photos（デフォルト）
          const seed = today.replace(/-/g, '')
          imageUrl = `https://picsum.photos/seed/${seed}/1920/1080`
        }

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
          logger.error('背景画像の読み込みに失敗しました')
          setState({
            imageUrl: null,
            loading: false,
            error: '画像を読み込めませんでした'
          })
        }

        img.src = imageUrl
      } catch (err) {
        logger.error('背景画像の取得に失敗しました:', err)
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
