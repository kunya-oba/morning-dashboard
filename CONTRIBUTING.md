# 開発ガイドライン

morning-dashboardプロジェクトへの貢献をご検討いただきありがとうございます。このドキュメントでは、プロジェクトの開発に参加する際のガイドラインを説明します。

---

## 📋 目次

1. [開発環境のセットアップ](#開発環境のセットアップ)
2. [開発フロー](#開発フロー)
3. [コーディング規約](#コーディング規約)
4. [コミットメッセージ](#コミットメッセージ)
5. [プルリクエスト](#プルリクエスト)
6. [テスト](#テスト)
7. [デバッグ](#デバッグ)

---

## 🛠️ 開発環境のセットアップ

### 必要な環境

- Node.js 18以上
- npm または yarn
- Git
- VSCode（推奨）

### VSCode拡張機能（推奨）

以下の拡張機能をインストールすることを推奨します：

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next"
  ]
}
```

### セットアップ手順

```bash
# リポジトリをクローン
git clone https://github.com/kunya-oba/morning-dashboard.git
cd morning-dashboard

# 依存関係をインストール
npm install

# 開発サーバーを起動
npm run dev
```

ブラウザで `http://localhost:5173/morning-dashboard/` にアクセスして動作を確認してください。

### 環境変数の設定（オプション）

Unsplash APIを使用する場合は、プロジェクトルートに `.env` ファイルを作成してください：

```bash
VITE_UNSPLASH_ACCESS_KEY=your_access_key_here
```

---

## 🔄 開発フロー

### 1. Issueの作成または選択

- 新機能やバグ修正を開始する前に、Issueを作成または既存のIssueを選択してください
- Issueには、目的、背景、期待される結果を明確に記載してください

### 2. ブランチの作成

ブランチ命名規則：

```
feature/機能名     # 新機能
fix/バグ内容       # バグ修正
refactor/対象     # リファクタリング
docs/内容         # ドキュメント更新
```

例：
```bash
git checkout -b feature/todo-card
git checkout -b fix/dark-mode-graph
git checkout -b refactor/api-types
```

### 3. 開発

- コードを書く前に [REVIEW.md](./REVIEW.md) を確認し、既知の問題を避けてください
- 小さな単位でコミットを作成してください
- 定期的に `git pull origin main` で最新の状態を取り込んでください

### 4. テスト

```bash
# TypeScriptの型チェック
npm run build

# 開発サーバーで動作確認
npm run dev

# ビルドしたファイルのプレビュー
npm run preview
```

### 5. プルリクエストの作成

- プルリクエストのテンプレートに従って、詳細な説明を記載してください
- 関連するIssue番号を記載してください（例: `Close #123`）
- レビュー可能な状態になったら、レビュアーを指定してください

---

## 📝 コーディング規約

### TypeScript

#### 型定義

```typescript
// ✅ Good: 明示的な型定義
interface WeatherData {
  temperature: number
  weatherCode: number
  precipitation: number
}

// ❌ Bad: anyの使用
const data: any = await axios.get(url)

// ✅ Good: ジェネリクスの使用
const response = await axios.get<WeatherData>(url)
```

#### 型アサーション

```typescript
// ❌ Bad: 不必要な型アサーション
const id = active.id as string

// ✅ Good: 型ガードの使用
if (typeof active.id !== 'string') return
const id = active.id
```

### React

#### コンポーネント定義

```typescript
// ✅ Good: 関数宣言
export default function WeatherCard() {
  // ...
}

// ✅ Good: propsの型定義
interface CardProps {
  id: string
  children: React.ReactNode
}

export default function Card({ id, children }: CardProps) {
  // ...
}
```

#### Hooks

```typescript
// ✅ Good: カスタムフックの命名
export function useBackgroundImage() {
  // ...
}

// ✅ Good: useEffectの依存配列
useEffect(() => {
  fetchData()
}, [fetchData]) // 依存関係を明示

// ✅ Good: クリーンアップ
useEffect(() => {
  const interval = setInterval(fetchData, 60000)
  return () => clearInterval(interval)
}, [])
```

#### 状態管理

```typescript
// ✅ Good: LocalStorageからの初期化
const [state, setState] = useState(() => {
  const saved = localStorage.getItem('key')
  return saved ? JSON.parse(saved) : defaultValue
})

// ✅ Good: 状態の更新と永続化
const updateState = (newValue: string) => {
  setState(newValue)
  localStorage.setItem('key', JSON.stringify(newValue))
}
```

### スタイリング（Tailwind CSS）

```tsx
// ✅ Good: クラス名の整理（グループ化）
<div className="
  flex items-center gap-3
  p-4 rounded-xl
  bg-white dark:bg-gray-800
  border border-gray-200 dark:border-gray-700
  hover:bg-gray-50 dark:hover:bg-gray-700/50
  transition-all
">

// ❌ Bad: 長すぎるクラス名（1行）
<div className="flex items-center gap-3 p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all">
```

### ファイル構成

```typescript
// ファイルの構成順序
// 1. import文
import { useState, useEffect } from 'react'
import { Sun, Cloud } from 'lucide-react'
import axios from 'axios'

// 2. 型定義
interface WeatherData {
  temperature: number
}

// 3. 定数
const API_URL = 'https://api.example.com'

// 4. ヘルパー関数
const formatTemperature = (temp: number) => `${temp}°C`

// 5. コンポーネント
export default function WeatherCard() {
  // ...
}
```

### 命名規則

```typescript
// ✅ Good: 明確で説明的な名前
const fetchWeatherData = async () => { /* ... */ }
const isNormalOperation = status?.includes('平常運転')
const WEATHER_UPDATE_INTERVAL = 10 * 60 * 1000

// ❌ Bad: 短すぎる、不明確な名前
const fetch = async () => { /* ... */ }
const flag = status?.includes('平常運転')
const INTERVAL = 600000
```

---

## 💬 コミットメッセージ

### フォーマット

```
<type>: <subject>

<body>

Co-Authored-By: Claude <noreply@anthropic.com>
```

### Type

- `feat`: 新機能
- `fix`: バグ修正
- `refactor`: リファクタリング
- `style`: スタイル変更（コードの動作に影響しない）
- `docs`: ドキュメントのみの変更
- `test`: テストの追加・修正
- `chore`: ビルドプロセスやツールの変更

### 例

```bash
feat: TODOカード機能を追加

- タスクの追加・編集・削除機能
- LocalStorageでの永続化
- 優先度の設定（高・中・低）
- ドラッグ&ドロップで並び替え

Close #42

Co-Authored-By: Claude <noreply@anthropic.com>
```

```bash
fix: ダークモード切り替え時にグラフの色が更新されない問題を修正

document.documentElement.classList.contains('dark')を
状態管理に変更し、リアクティブに更新されるようにした。

Fixes #15

Co-Authored-By: Claude <noreply@anthropic.com>
```

---

## 🔍 プルリクエスト

### チェックリスト

プルリクエストを作成する前に、以下を確認してください：

- [ ] コードが正常に動作する
- [ ] TypeScriptの型エラーがない（`npm run build`）
- [ ] コーディング規約に準拠している
- [ ] 不要なconsole.logを削除した
- [ ] コメントやドキュメントを更新した
- [ ] 既存の機能を壊していない
- [ ] モバイル・タブレットでも動作確認した
- [ ] ダークモードでも正常に表示される

### テンプレート

```markdown
## 概要
この変更の目的を簡潔に説明してください。

## 変更内容
- 変更点1
- 変更点2
- 変更点3

## 関連Issue
Close #XXX

## スクリーンショット（UI変更の場合）
変更前と変更後のスクリーンショットを添付してください。

## テスト方法
1. XXXを開く
2. YYYをクリックする
3. ZZZが表示されることを確認する

## チェックリスト
- [ ] コードが正常に動作する
- [ ] TypeScriptの型エラーがない
- [ ] モバイル・タブレットでも動作確認した
- [ ] ダークモードでも正常に表示される
```

---

## 🧪 テスト

現在、このプロジェクトには自動テストがありませんが、以下の手動テストを実施してください。

### ブラウザテスト

- Chrome（最新版）
- Firefox（最新版）
- Safari（最新版）
- モバイルブラウザ（iOS Safari、Chrome Mobile）

### テスト項目

#### 基本機能
- [ ] すべてのカードが正常に表示される
- [ ] データが正常に取得される
- [ ] エラー時の表示が適切
- [ ] ローディング表示が適切

#### ドラッグ&ドロップ
- [ ] カードをドラッグして順序を変更できる
- [ ] 順序がLocalStorageに保存される
- [ ] ページをリロードしても順序が保持される

#### ダークモード
- [ ] ダークモードの切り替えが動作する
- [ ] すべてのカードでダークモードが適用される
- [ ] グラフやアイコンも色が変わる

#### レスポンシブ
- [ ] スマートフォンで正常に表示される
- [ ] タブレットで正常に表示される
- [ ] デスクトップで正常に表示される

---

## 🐛 デバッグ

### 開発者ツールの使用

```javascript
// 開発環境でのデバッグ
console.log('デバッグ情報:', data)

// 本番環境では削除すること！
```

### よくある問題と解決方法

#### 1. CORSエラー

**問題**: `Access to fetch at 'https://...' from origin 'http://localhost:5173' has been blocked by CORS policy`

**解決方法**:
- CORSプロキシが正常に動作しているか確認
- 複数のプロキシでフォールバックを実装

#### 2. LocalStorageのデータが残っている

**問題**: 開発中に古いデータが残って動作がおかしい

**解決方法**:
```javascript
// ブラウザのコンソールで実行
localStorage.clear()
location.reload()
```

#### 3. 環境変数が読み込まれない

**問題**: `.env`ファイルを作成したがAPIキーが読み込まれない

**解決方法**:
- 開発サーバーを再起動する
- `VITE_`プレフィックスが付いているか確認
- `.env`ファイルがプロジェクトルートにあるか確認

---

## 📚 参考リソース

### 公式ドキュメント
- [React 19 Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [dnd-kit Documentation](https://docs.dndkit.com/)

### プロジェクト内ドキュメント
- [CLAUDE.md](./CLAUDE.md) - プロジェクト開発ルール
- [REVIEW.md](./REVIEW.md) - コードレビュー結果と改善点
- [FEATURE_PROPOSALS.md](./FEATURE_PROPOSALS.md) - 機能追加提案
- [API.md](./API.md) - API仕様書

---

## 🤝 コミュニティ

### 質問や議論

- GitHubのIssueで質問してください
- 新機能のアイデアはDiscussionsで議論できます

### 行動規範

- 敬意を持って接する
- 建設的なフィードバックを心がける
- 多様性を尊重する

---

## 📞 サポート

問題が発生した場合は、以下の方法でサポートを受けることができます：

1. [既存のIssue](https://github.com/kunya-oba/morning-dashboard/issues)を検索
2. 該当するIssueがない場合は新しいIssueを作成
3. 必要な情報（エラーメッセージ、環境、再現手順など）を提供

---

**ご協力ありがとうございます！** 🎉
