import { testRule } from "../../utils/custom-test-rule";
import rule from "../../../src/rules/stacking-context/ineffective-on-background-blend";

const { ruleName } = rule;

testRule({
  plugins: [process.cwd()],
  ruleName,
  config: true,

  accept: [
    {
      code: ".valid { isolation: isolate; }",
      description: "単純なisolation: isolateの使用",
    },
    {
      code: ".valid { background-blend-mode: multiply; }",
      description: "単純なbackground-blend-modeの使用",
    },
    {
      code: ".valid { isolation: isolate; mix-blend-mode: multiply; }",
      description: "isolation: isolateとmix-blend-modeの組み合わせは有効",
    },
    {
      code: ".valid { background-blend-mode: normal; isolation: isolate; }",
      description:
        "background-blend-mode: normalは特別な効果がないため問題なし",
    },
  ],

  reject: [
    {
      code: ".invalid { background-blend-mode: multiply; isolation: isolate; }",
      description: "background-blend-modeにisolation: isolateが効果がない",
      message:
        "無効なisolation: isolateです。このプロパティは、要素内部の背景レイヤーで動作するbackground-blend-modeには影響しません。",
      line: 1,
      column: 46,
    },
    {
      code: ".invalid { background-blend-mode: screen; isolation: isolate; }",
      description:
        "background-blend-mode: screenにisolation: isolateが効果がない",
      message:
        "無効なisolation: isolateです。このプロパティは、要素内部の背景レイヤーで動作するbackground-blend-modeには影響しません。",
      line: 1,
      column: 44,
    },
    {
      code: ".invalid { background-blend-mode: overlay; isolation: isolate; }",
      description:
        "background-blend-mode: overlayにisolation: isolateが効果がない",
      message:
        "無効なisolation: isolateです。このプロパティは、要素内部の背景レイヤーで動作するbackground-blend-modeには影響しません。",
      line: 1,
      column: 45,
    },
  ],
});
