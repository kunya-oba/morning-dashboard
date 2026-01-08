import { useEffect, useState } from 'react'
import { Calendar, Sparkles, Loader2 } from 'lucide-react'
import axios from 'axios'

interface Anniversary {
  title: string
  description: string
}

export default function AnniversaryCard() {
  const [anniversary, setAnniversary] = useState<Anniversary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAnniversary = async () => {
      try {
        setLoading(true)
        setError(null)

        // 今日の日付を取得（日本時間）
        const today = new Date()
        const month = today.getMonth() + 1
        const day = today.getDate()

        // Wikipedia APIから「○月○日」のページを取得
        const wikiUrl = `https://ja.wikipedia.org/api/rest_v1/page/summary/${month}月${day}日`

        const response = await axios.get(wikiUrl, {
          timeout: 10000
        })

        // Wikipediaの要約から記念日情報を抽出
        let description = response.data.extract || ''

        // 記念日情報を抽出するための簡単なパース
        // 「○○の日」というパターンを探す
        const anniversaryPattern = /[^、。]*(?:の日|記念日)[^、。]*/g
        const matches = description.match(anniversaryPattern)

        let selectedAnniversary: Anniversary | null = null

        if (matches && matches.length > 0) {
          // ランダムに1つ選択
          const randomMatch = matches[Math.floor(Math.random() * matches.length)]
          selectedAnniversary = {
            title: randomMatch.trim(),
            description: `${month}月${day}日は${randomMatch.trim()}です。`
          }
        } else {
          // パターンマッチしない場合、最初の文を使用
          const firstSentence = description.split('。')[0] + '。'
          selectedAnniversary = {
            title: `${month}月${day}日`,
            description: firstSentence || `${month}月${day}日の記念日情報`
          }
        }

        setAnniversary(selectedAnniversary)
      } catch (err) {
        console.error('記念日情報の取得に失敗しました:', err)

        // フォールバック: 日本の主要な記念日データ
        const fallbackAnniversaries = getFallbackAnniversaries()
        const today = new Date()
        const key = `${today.getMonth() + 1}-${today.getDate()}`

        if (fallbackAnniversaries[key]) {
          setAnniversary(fallbackAnniversaries[key])
        } else {
          setError('記念日情報を取得できませんでした')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchAnniversary()
  }, [])

  // フォールバック用の記念日データ
  const getFallbackAnniversaries = (): Record<string, Anniversary> => {
    const today = new Date()
    const month = today.getMonth() + 1
    const day = today.getDate()

    return {
      '1-1': { title: '元日', description: '1月1日は元日です。年の初めを祝う国民の祝日です。' },
      '1-7': { title: '七草', description: '1月7日は七草の日です。七草粥を食べる風習があります。' },
      '2-3': { title: '節分', description: '2月3日は節分です。豆まきをして邪気を払います。' },
      '2-11': { title: '建国記念の日', description: '2月11日は建国記念の日です。日本の建国を祝う祝日です。' },
      '2-14': { title: 'バレンタインデー', description: '2月14日はバレンタインデーです。チョコレートを贈る日として知られています。' },
      '3-3': { title: 'ひな祭り', description: '3月3日はひな祭りです。女の子の健やかな成長を願う日です。' },
      '3-14': { title: 'ホワイトデー', description: '3月14日はホワイトデーです。バレンタインのお返しをする日です。' },
      '3-20': { title: '春分の日', description: `${month}月${day}日は春分の日です。昼と夜の長さがほぼ等しくなる日です。` },
      '4-1': { title: 'エイプリルフール', description: '4月1日はエイプリルフールです。罪のない嘘をついても良いとされる日です。' },
      '4-29': { title: '昭和の日', description: '4月29日は昭和の日です。激動の日々を経て復興した昭和の時代を顧みる祝日です。' },
      '5-3': { title: '憲法記念日', description: '5月3日は憲法記念日です。日本国憲法の施行を記念する祝日です。' },
      '5-4': { title: 'みどりの日', description: '5月4日はみどりの日です。自然に親しみ、その恩恵に感謝する祝日です。' },
      '5-5': { title: 'こどもの日', description: '5月5日はこどもの日です。こどもの人格を重んじ、幸福を図る祝日です。' },
      '5-10': { title: 'コットンの日', description: '5月10日はコットンの日です。5（こ）10（ten）でコットンの日です。' },
      '7-7': { title: '七夕', description: '7月7日は七夕です。織姫と彦星の伝説で知られる日です。' },
      '8-11': { title: '山の日', description: '8月11日は山の日です。山に親しむ機会を得て、山の恩恵に感謝する祝日です。' },
      '9-23': { title: '秋分の日', description: `${month}月${day}日は秋分の日です。祖先を敬い、亡くなった人を偲ぶ祝日です。` },
      '10-10': { title: '目の愛護デー', description: '10月10日は目の愛護デーです。10を横にすると眉と目の形に見えることから。' },
      '10-31': { title: 'ハロウィン', description: '10月31日はハロウィンです。仮装をして楽しむイベントとして定着しています。' },
      '11-3': { title: '文化の日', description: '11月3日は文化の日です。自由と平和を愛し、文化をすすめる祝日です。' },
      '11-11': { title: 'ポッキー&プリッツの日', description: '11月11日はポッキー&プリッツの日です。数字の「1」が並ぶことから。' },
      '11-15': { title: '七五三', description: '11月15日は七五三です。3歳、5歳、7歳の子どもの成長を祝う日です。' },
      '11-23': { title: '勤労感謝の日', description: '11月23日は勤労感謝の日です。勤労を尊び、生産を祝う祝日です。' },
      '12-24': { title: 'クリスマスイブ', description: '12月24日はクリスマスイブです。クリスマスの前夜祭です。' },
      '12-25': { title: 'クリスマス', description: '12月25日はクリスマスです。イエス・キリストの降誕を祝う日です。' },
      '12-31': { title: '大晦日', description: '12月31日は大晦日です。一年の最後の日で、除夜の鐘をつく習慣があります。' }
    }
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all">
        <h2 className="text-2xl font-display font-semibold mb-4 text-gray-800 dark:text-gray-100 flex items-center gap-2">
          <Calendar className="w-7 h-7 text-indigo-500" />
          今日は何の日
        </h2>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 text-gray-400 dark:text-gray-500 animate-spin" />
        </div>
      </div>
    )
  }

  if (error || !anniversary) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all">
        <h2 className="text-2xl font-display font-semibold mb-4 text-gray-800 dark:text-gray-100 flex items-center gap-2">
          <Calendar className="w-7 h-7 text-indigo-500" />
          今日は何の日
        </h2>
        <div className="text-orange-500 dark:text-orange-400">
          <p>{error || '記念日情報を読み込めませんでした'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all">
      <h2 className="text-2xl font-display font-semibold mb-6 text-gray-800 dark:text-gray-100 flex items-center gap-2">
        <Calendar className="w-7 h-7 text-indigo-500" />
        今日は何の日
      </h2>

      <div className="space-y-4">
        <div className="flex items-start gap-4 p-5 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-100 dark:border-indigo-800">
          <Sparkles className="w-8 h-8 text-indigo-500 dark:text-indigo-400 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-xl font-bold text-indigo-900 dark:text-indigo-200 mb-2">
              {anniversary.title}
            </h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {anniversary.description}
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
            {new Date().toLocaleDateString('ja-JP', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              weekday: 'long'
            })}
          </p>
        </div>
      </div>
    </div>
  )
}
