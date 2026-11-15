export type Project = {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  updatedLabel: string;
};

export type PostStatus = "open" | "resolved";

export type Post = {
  id: string;
  projectId: string;
  title: string;
  content: string;
  summary: string;
  technologies: string[];
  status: PostStatus;
  resolution?: string;
  author: string;
  createdLabel: string;
};

export const initialProjects: Project[] = [
  {
    id: "aws-training",
    name: "AWS研修",
    description: "AWSを使った技術共有アプリの開発。つまずきと解決策を記録します。",
    technologies: ["AWS", "Next.js", "TypeScript"],
    updatedLabel: "10分前",
  },
  {
    id: "frontend-study",
    name: "フロントエンド学習",
    description: "ReactとTypeScriptの学習中に発生した問題をまとめます。",
    technologies: ["React", "TypeScript"],
    updatedLabel: "昨日",
  },
  {
    id: "personal-dev",
    name: "個人開発メモ",
    description: "個人開発で試した技術や設定の記録です。",
    technologies: ["Next.js", "Tailwind CSS"],
    updatedLabel: "3日前",
  },
];

export const initialPosts: Post[] = [
  {
    id: "dynamodb-write",
    projectId: "aws-training",
    title: "DynamoDBへの書き込みが失敗する",
    summary: "PutItemでAccessDeniedExceptionが発生しています。",
    content:
      "PutItemを実行したところ、AccessDeniedExceptionが発生しました。\nテーブル名やリージョンに誤りがないことを確認しても解消しませんでした。\n\nIAMポリシーと実行ロールを確認しています。",
    technologies: ["AWS", "DynamoDB"],
    status: "open",
    author: "北田 大海",
    createdLabel: "15分前",
  },
  {
    id: "lambda-dynamodb",
    projectId: "aws-training",
    title: "LambdaからDynamoDBへ接続できない",
    summary: "実行ロールへ必要な権限を追加して解決しました。",
    content:
      "LambdaからDynamoDBへ接続するとAccessDeniedExceptionが発生していました。実行ロールと対象リソースを確認しました。",
    technologies: ["AWS", "Lambda"],
    status: "resolved",
    resolution: "実行ロールにdynamodb:PutItem権限を追加し、対象ARNを修正。",
    author: "北田 大海",
    createdLabel: "昨日",
  },
  {
    id: "deploy-env",
    projectId: "aws-training",
    title: "環境変数がデプロイ先で読み込まれない",
    summary: "ローカルでは動作しますが、公開環境で値がundefinedになります。",
    content:
      "ローカルの.env.localでは取得できますが、公開環境では環境変数がundefinedになります。",
    technologies: ["Next.js"],
    status: "open",
    author: "北田 大海",
    createdLabel: "2日前",
  },
  {
    id: "use-effect-loop",
    projectId: "frontend-study",
    title: "useEffectが繰り返し実行される",
    summary: "依存配列のオブジェクト参照を見直して解決しました。",
    content: "useEffectの依存配列に毎回生成されるオブジェクトを指定していました。",
    technologies: ["React"],
    status: "resolved",
    resolution: "依存配列のオブジェクト参照をuseMemoで固定。",
    author: "北田 大海",
    createdLabel: "2日前",
  },
  {
    id: "production-env",
    projectId: "personal-dev",
    title: "本番環境で環境変数を取得できない",
    summary: "ホスティング側の設定を見直して解決しました。",
    content: "ビルド時に必要な環境変数がホスティング側へ登録されていませんでした。",
    technologies: ["Next.js"],
    status: "resolved",
    resolution: "ホスティング側の環境変数設定後に再デプロイ。",
    author: "北田 大海",
    createdLabel: "4日前",
  },
];
