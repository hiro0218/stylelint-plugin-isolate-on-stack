/**
 * ルールごとのメッセージを集約するユーティリティ
 */

export const zIndexRangeMessages = {
  rejected: (zIndexValue: number, maxZIndex: number) =>
    `z-index値「${zIndexValue}」は許容範囲（最大: ${maxZIndex}）を超えています。`,
};

export const noRedundantDeclarationMessages = {
  rejected:
    "冗長なisolation: isolateです。他のスタッキングコンテキスト作成プロパティが存在しない場合は不要です。",
};

export const ineffectiveOnBackgroundBlendMessages = {
  rejected:
    "無効なisolation: isolateです。このプロパティは、要素内部の背景レイヤーで動作するbackground-blend-modeには影響しません。",
};

export const preferOverSideEffectsMessages = {
  rejected:
    "isolation: isolateの代わりに、transformやwill-changeなど他のスタッキングコンテキスト作成プロパティの利用を検討してください。",
};

export const performanceHighDescendantCountMessages = {
  rejected:
    "isolation: isolateによるスタッキングコンテキストは、子孫要素が多い場合パフォーマンスに悪影響を与える可能性があります。",
};
