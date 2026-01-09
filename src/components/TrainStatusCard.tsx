import { useEffect, useState } from 'react'
import { Train, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import axios from 'axios'
import { logger } from '../utils/logger'
import { INTERVALS } from '../constants/intervals'

interface TrainStatus {
  operator: string
  railway: string
  status: string
  detail?: string
}

export default function TrainStatusCard() {
  const [status, setStatus] = useState<TrainStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTrainStatus = async () => {
      try {
        setLoading(true)
        setError(null)

        logger.log('運行情報取得開始...')

        // 都営浅草線の公式ページから運行情報を取得
        const targetUrl = 'https://www.kotsu.metro.tokyo.jp/subway/schedule/asakusa.html'

        // CORSプロキシを使用してHTMLを取得
        const proxies = [
          `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`,
          `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`
        ]

        let htmlContent = null
        let lastError = null

        for (const proxyUrl of proxies) {
          try {
            logger.log('プロキシを試行中:', proxyUrl)
            const response = await axios.get(proxyUrl, {
              timeout: 15000
            })

            // AllOrigins の場合、contentsプロパティを確認
            if (response.data.contents) {
              htmlContent = response.data.contents
            } else {
              htmlContent = response.data
            }

            logger.log('HTML取得成功')
            break
          } catch (err) {
            console.warn('プロキシ失敗:', proxyUrl, err)
            lastError = err
            continue
          }
        }

        if (!htmlContent) {
          throw lastError || new Error('HTMLの取得に失敗しました')
        }

        // HTMLから運行情報を抽出
        const parser = new DOMParser()
        const doc = parser.parseFromString(htmlContent, 'text/html')

        // 運行情報のセクションを探す
        let statusText = '平常運転'
        let detailText = ''

        // InformationUnkou クラスから情報を取得
        const infoUnkouElements = doc.querySelectorAll('.InformationUnkou, #InformationUnkou, [class*="InformationUnkou"]')

        logger.log('InformationUnkou要素数:', infoUnkouElements.length)

        let foundInfo = false

        if (infoUnkouElements.length > 0) {
          // InformationUnkou内のテキストを取得
          const textContent = Array.from(infoUnkouElements)
            .map(el => el.textContent?.trim())
            .filter(text => text && text.length > 0)
            .join(' ')

          logger.log('取得したテキスト:', textContent)

          if (textContent && textContent.length > 0) {
            // まずネガティブな表現（遅延がない）をチェック
            const hasNoDelay =
              textContent.includes('遅延はありません') ||
              textContent.includes('遅延はございません') ||
              textContent.includes('遅延なし') ||
              textContent.includes('運転見合わせはありません') ||
              textContent.includes('平常通り') ||
              textContent.includes('平常どおり') ||
              textContent.includes('通常通り') ||
              textContent.includes('通常どおり') ||
              textContent.includes('正常に運転') ||
              textContent.includes('順調に運転')

            // 次に遅延があるかチェック
            const hasDelay =
              textContent.includes('遅延が発生') ||
              textContent.includes('遅延しています') ||
              textContent.includes('遅れが発生') ||
              textContent.includes('運転見合わせ') && !textContent.includes('運転見合わせはありません') ||
              textContent.includes('運転を見合わせ') ||
              textContent.includes('運休') && !textContent.includes('運休はありません') ||
              textContent.includes('ダイヤ乱れ') ||
              textContent.includes('事故の影響') ||
              textContent.includes('故障の影響')

            if (hasNoDelay || (!hasDelay && (
                textContent.includes('平常') ||
                textContent.includes('通常') ||
                textContent.includes('正常') ||
                textContent.includes('運転しています')))) {
              // 平常運転
              statusText = '平常運転'
              detailText = textContent.substring(0, 100)
              foundInfo = true
            } else if (hasDelay) {
              // 遅延・運転見合わせ等あり
              statusText = '遅延・運転見合わせ等あり'
              detailText = textContent.substring(0, 150)
              foundInfo = true
            } else if (textContent.length > 10) {
              // その他の情報がある場合（判断できない場合は平常運転とする）
              statusText = '平常運転'
              detailText = textContent.substring(0, 100)
              foundInfo = true
            }
          }
        }

        // 他のセレクタも試す（フォールバック）
        if (!foundInfo) {
          logger.log('InformationUnkouで情報が見つからないため、他のセレクタを試行...')

          const fallbackSelectors = [
            '.unko-info',
            '.service-info',
            '#service_status',
            '.status-info',
            '[class*="unkou"]',
            '[class*="status"]',
            'div[id*="info"]'
          ]

          for (const selector of fallbackSelectors) {
            const elements = doc.querySelectorAll(selector)
            if (elements.length > 0) {
              const textContent = Array.from(elements)
                .map(el => el.textContent?.trim())
                .filter(text => text && text.length > 0)
                .join(' ')

              if (textContent && textContent.length > 10) {
                logger.log(`${selector} で情報発見:`, textContent.substring(0, 50))

                // ネガティブな表現をチェック
                const hasNoDelay =
                  textContent.includes('遅延はありません') ||
                  textContent.includes('遅延はございません') ||
                  textContent.includes('平常通り') ||
                  textContent.includes('通常通り')

                // 遅延があるかチェック
                const hasDelay =
                  textContent.includes('遅延が発生') ||
                  textContent.includes('遅延しています') ||
                  (textContent.includes('運転見合わせ') && !textContent.includes('運転見合わせはありません'))

                if (hasNoDelay || (!hasDelay && (textContent.includes('平常') || textContent.includes('通常')))) {
                  statusText = '平常運転'
                  detailText = textContent.substring(0, 100)
                  foundInfo = true
                  break
                } else if (hasDelay) {
                  statusText = '遅延・運転見合わせ等あり'
                  detailText = textContent.substring(0, 150)
                  foundInfo = true
                  break
                }
              }
            }
          }
        }

        // それでも見つからない場合は、平常運転と判断
        if (!foundInfo) {
          logger.log('運行情報が見つかりませんでした。平常運転と判断します。')
          statusText = '平常運転'
          detailText = '現在、運行に関する情報はありません'
        }

        logger.log('運行情報解析完了:', { statusText, detailText })

        setStatus({
          operator: '都営地下鉄',
          railway: '浅草線',
          status: statusText,
          detail: detailText
        })
      } catch (err) {
        logger.error('運行情報の取得に失敗しました:', err)

        if (axios.isAxiosError(err)) {
          logger.error('Axiosエラー詳細:', {
            message: err.message,
            response: err.response?.data,
            status: err.response?.status
          })
        }

        // エラーの場合は平常運転として表示
        setStatus({
          operator: '都営地下鉄',
          railway: '浅草線',
          status: '情報取得中',
          detail: '公式サイトで最新情報をご確認ください'
        })

        setError('運行情報を取得できませんでした')
      } finally {
        setLoading(false)
      }
    }

    fetchTrainStatus()
    // 5分ごとに更新
    const interval = setInterval(fetchTrainStatus, INTERVALS.TRAIN_STATUS_UPDATE)
    return () => clearInterval(interval)
  }, [])

  const isNormalOperation = status?.status.includes('平常運転') || status?.status.includes('Normal')

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all">
        <h2 className="text-2xl font-display font-semibold mb-4 text-gray-800 dark:text-gray-100 flex items-center gap-2">
          <Train className="w-7 h-7 text-pink-500" />
          都営浅草線
        </h2>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 text-gray-400 dark:text-gray-500 animate-spin" />
        </div>
      </div>
    )
  }

  if (!status) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all">
        <h2 className="text-2xl font-display font-semibold mb-4 text-gray-800 dark:text-gray-100 flex items-center gap-2">
          <Train className="w-7 h-7 text-pink-500" />
          都営浅草線
        </h2>
        <div className="text-red-500 dark:text-red-400">
          <p>{error || '運行情報を読み込めませんでした'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all">
      <h2 className="text-2xl font-display font-semibold mb-6 text-gray-800 dark:text-gray-100 flex items-center gap-2">
        <Train className="w-7 h-7 text-pink-500" />
        {status.railway}
      </h2>

      <div className="space-y-4">
        {/* 運行状態 */}
        <div className={`flex items-start gap-3 p-4 rounded-xl ${
          isNormalOperation
            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
            : 'bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800'
        }`}>
          {isNormalOperation ? (
            <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-6 h-6 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <p className={`font-semibold text-lg ${
              isNormalOperation
                ? 'text-green-800 dark:text-green-300'
                : 'text-orange-800 dark:text-orange-300'
            }`}>
              {status.status}
            </p>
            {status.detail && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {status.detail}
              </p>
            )}
          </div>
        </div>

        {/* 路線情報 */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500 dark:text-gray-400">運営事業者</span>
            <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
              {status.operator}
            </span>
          </div>
        </div>

        {error && (
          <div className="text-xs text-gray-400 dark:text-gray-500 text-center pt-2">
            ※ APIキーを設定すると詳細情報が取得できます
          </div>
        )}

        <div className="text-xs text-gray-400 dark:text-gray-500 text-center">
          5分ごとに更新
        </div>
      </div>
    </div>
  )
}
