# StuckLog Project MVP Demo

Figmaで設計した、プロジェクト単位でつまずきと解決策を共有するWebアプリの操作可能なデモです。Next.js 16、React 19、Tailwind CSSで構成しています。

## できること

- プロジェクトの作成と複数技術タグの登録
- プロジェクト別の投稿一覧、検索、状態絞り込み
- 投稿の作成、編集、解決済み登録
- プロジェクトの使用技術の編集
- 全プロジェクトを横断した解決済みナレッジ検索
- プロジェクト・技術によるナレッジの絞り込み
- 空の状態、検索結果0件、入力エラーの表示

## 起動方法

```bash
npm run dev
```

ブラウザで `http://localhost:3000` を開いてください。

## 主な画面

- `/`: プロジェクト一覧・プロジェクト作成
- `/projects/aws-training`: プロジェクト内の投稿一覧
- `/projects/aws-training/posts/new`: 新規投稿
- `/posts/dynamodb-write`: 投稿詳細・編集・解決済み登録
- `/knowledge`: 全プロジェクト横断の解決済みナレッジ

## デモとして置き換えている部分

AWSへ接続する前段階のため、データはブラウザのメモリ上で管理しています。該当箇所には `DEMO:` で始まるコメントを記載しています。

- `src/data/demo-data.ts`: DynamoDBから取得する代わりの初期データ
- `src/lib/demo-store.tsx`: API経由のCRUD処理の代わりとなるReact state

画面遷移、検索、絞り込み、タグ追加、投稿・編集・解決済みへの更新は実際に動作します。ページを再読み込みするとデモデータへ戻ります。

## AWS接続時の想定

- ホスティング: AWS Amplify Hosting
- API: API Gateway + Lambda
- データ保存: DynamoDB
- 認証を追加する場合: Amazon Cognito
