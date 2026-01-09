import { useState, useEffect } from 'react'

/**
 * ダークモード状態を監視し、reactiveに更新するカスタムフック
 * MutationObserverを使用してドキュメントのclass属性の変更を検知
 */
export function useDarkMode() {
  const [isDark, setIsDark] = useState(
    () => document.documentElement.classList.contains('dark')
  )

  useEffect(() => {
    // MutationObserverでdocumentのclass属性を監視
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'))
    })

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    })

    return () => observer.disconnect()
  }, [])

  return isDark
}
