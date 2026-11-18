# StuckLog Project MVP

プロジェクト単位で技術的なつまずきと解決策を共有するWebアプリです。教材との一致を優先し、Next.jsをEC2上で実行し、データをRDS MySQLへ保存する構成です。

## AWS構成

```text
ブラウザ → EC2（Next.js / Node.js）→ RDS MySQL
```

- ホスティング・API: Amazon EC2上のNext.js
- データ保存: Amazon RDS for MySQL
- ネットワーク: Amazon VPCとセキュリティグループ
- EC2の操作: AWS Systems Manager Session Managerを推奨

この構成は、教材のDay 2「EC2・VPC」とDay 3「RDS・Node.js CRUD」に対応します。

## できること

- プロジェクトの作成と複数技術タグの登録
- プロジェクト別の投稿一覧、検索、状態絞り込み
- 投稿の作成、編集、状態（未解決・解決済み・保留・対応コスト過大・外部要因待ち）の登録
- プロジェクトの使用技術の編集
- 全プロジェクトを横断したナレッジ検索
- プロジェクト・状態・技術によるナレッジの絞り込み
- RDS MySQLへの永続保存
- 読み込み・保存失敗時のエラー表示と再試行

## ローカル起動

Docker Desktopを起動して、ローカル開発用MySQLを作成します。初回起動時にテーブルと初期データも自動作成されます。

```bash
npm run db:up
```

ローカル用の環境変数を作成します（初回のみ）。

```bash
cp .env.local.example .env.local
```

アプリを起動します。

```bash
npm install
npm run dev
```

ブラウザで `http://localhost:3000` を開いてください。

MySQLを停止する場合は `npm run db:down`、初期データから作り直す場合は `npm run db:reset` を実行します。ローカル用MySQLは `127.0.0.1:3307` だけで待ち受けるため、AWS上のRDSには接続しません。

## 主な画面

- `/`: プロジェクト一覧・プロジェクト作成
- `/projects/[projectId]`: プロジェクト内の投稿一覧
- `/projects/[projectId]/posts/new`: 新規投稿
- `/posts/[id]`: 投稿詳細・編集・状態変更
- `/knowledge`: 全プロジェクト横断のナレッジ

## API

- `GET /api/projects`: プロジェクト一覧
- `POST /api/projects`: プロジェクト作成
- `PATCH /api/projects/[projectId]`: 使用技術更新
- `GET /api/posts`: 投稿一覧
- `POST /api/posts`: 投稿作成
- `PATCH /api/posts/[id]`: 投稿編集・状態変更

既存のデータベースへ反映する場合は、デプロイ前に `database/migrations/001_expand_post_status.sql` を実行してください。新規データベースでは `database/schema.sql` に反映済みです。

## AWSへの配置

VPC、セキュリティグループ、EC2、RDSの具体的な作成・確認手順は [AWS構築手順](docs/aws-deployment.md) を参照してください。

## 検証

```bash
npm run lint
npm run build
```

セキュリティアクセスログの仕様、プライバシー方針、User-Agent別の検証方法は[セキュリティアクセスログ調査](docs/security-logging.md)を参照してください。
