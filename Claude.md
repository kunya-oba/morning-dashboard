# CLAUDE.md

# Project: morning-dashboard

## 1. 基本ルール (Core Instructions)
- 言語: 応答、コードコメント、ドキュメントはすべて「日本語」で記述すること。
- 性格: あなたはシニアエンジニアとして、簡潔で正確なコードを提案してください。

## プロジェクト固有のルール
- デプロイ先: GitHub Pages (URLパスに注意し、`vite.config.ts` の `base` をリポジトリ名に設定すること)
- UI/デザイン:
  - モバイルファーストで設計し、朝にふさわしい清潔感のあるデザインにする。（ダークモード対応）
  - アイコンは `lucide-react` を使用すること。
  - Tailwind CSS を使って、モダンなカード形式のUIにする。
- API連携:
  - 天気: Open-Meteo API を使用 (緯度経度は東京をデフォルトとする)。
  - 運行状況: 東京都交通局の公式ページ (https://www.kotsu.metro.tokyo.jp/subway/schedule/asakusa.html) から直接参照。CORSプロキシ経由でHTMLを取得し、運行情報をパースすること。
  - ニュース: Google News RSS を CORSプロキシ経由で取得。
  - 偉人の言葉: ZenQuotes API を CORSプロキシ経由で取得し、MyMemory Translation API または LibreTranslate API で日本語に翻訳。
  - 今日は何の日: Wikipedia API (日本語版) から「○月○日」のページを取得し、記念日情報を抽出。
  - フェッチ処理には `axios` を使い、ローディング状態とエラーハンドリングを必ず実装すること。
  - CORS制限があるAPIは、`https://api.allorigins.win/get?url=` または `https://corsproxy.io/?` などのプロキシを使用すること。
- 日本語対応: 曜日や天気の表記、ニュースのタイトルなど、表示はすべて日本語で行うこと。
- タイポグラフィ：美しく、ユニークで興味深いフォントを選択してください。ArialやInterなどの一般的なフォントを避けてください。代わりに、フロントエンドの美学を高める特徴的な選択肢を選択してください。
- ファイル作成時に、そのファイルがGithubに挙げられるべきではないと判断した場合には、必ず.gitignoreに指定してください。
