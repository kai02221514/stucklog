
export const POST_TEMPLATES = [
  {
    id: "trouble",
    label: "障害・エラー",
    description: "不具合の状況や試した対応を整理",
    content: `【発生した問題】

【エラーメッセージ】

【発生条件・環境】

【試したこと】

【現在分かっていること】`,
  },
  {
    id: "investigation",
    label: "調査メモ",
    description: "調べた目的、情報、結論を記録",
    content: `【調査の目的】

【確認した情報】

【分かったこと】

【未確認・追加で調べること】

【参考資料】`,
  },
  {
    id: "decision",
    label: "設計上の判断",
    description: "選択肢と採用理由を残す",
    content: `【検討したこと】

【選択肢】

【採用した方針】

【判断理由】

【懸念点・見直し条件】`,
  },
] as const;

export type PostTemplate = (typeof POST_TEMPLATES)[number];
