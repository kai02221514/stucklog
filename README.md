# StuckLog Minimal MVP Demo

Figmaで作成した最小実装版を、Next.js + Tailwind CSSで再現した操作可能なデモです。

## できること

- 投稿一覧の表示
- タイトル・内容・技術タグを対象にした検索
- 新規投稿
- 投稿詳細の閲覧
- 検索結果0件、存在しない投稿の状態表示

## 起動方法

```bash
npm run dev
```

ブラウザで `http://localhost:3000` を開いてください。

## デモとして置き換えている部分

このデモはAWSへまだ接続していません。該当コードには `DEMO:` で始まるコメントを付けています。

- `src/data/demo-posts.ts`: DynamoDBから取得する代わりの初期データ
- `src/lib/demo-post-store.tsx`: API経由の取得・投稿の代わりにReact stateとlocalStorageを使用
- `src/app/page.tsx`: 検索APIの代わりにブラウザ内で絞り込み
- `src/app/posts/new/page.tsx`: 投稿APIの代わりにデモストアへ保存
- `src/app/posts/[id]/page.tsx`: 詳細取得APIの代わりにデモストアからID検索

画面遷移自体はNext.jsのルーティングで実装しており、デモ用の見せかけではありません。

## 将来のAWS接続候補

- フロントエンド: AWS Amplify Hosting
- API: API Gateway + Lambda
- データ保存: DynamoDB
