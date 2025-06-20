/**
 * ルールごとのメッセージを集約するユーティリティ
 */

export const zIndexRangeMessages = {
  rejected: (zIndexValue: number, maxZIndex: number) =>
    // z-index値「${zIndexValue}」は許容範囲（最大: ${maxZIndex}）を超えています。
    `z-index value '${zIndexValue}' exceeds the allowed range (maximum: ${maxZIndex}).`,
};

export const noRedundantDeclarationMessages = {
  rejected:
    // 冗長なisolation: isolateです。他のスタッキングコンテキスト作成プロパティが存在しない場合は不要です。
    "Redundant 'isolation: isolate'. This property is unnecessary when no other stacking context properties exist.",
};

export const ineffectiveOnBackgroundBlendMessages = {
  rejected:
    // 無効なisolation: isolateです。このプロパティは、要素内部の背景レイヤーで動作するbackground-blend-modeには影響しません。
    "Ineffective 'isolation: isolate'. This property does not affect background-blend-mode which operates on background layers within the element.",
};

export const preferOverSideEffectsMessages = {
  rejected:
    // isolation: isolateの代わりに、transformやwill-changeなど他のスタッキングコンテキスト作成プロパティの利用を検討してください。
    "Consider using other stacking context properties like 'transform' or 'will-change' instead of 'isolation: isolate'.",
};
