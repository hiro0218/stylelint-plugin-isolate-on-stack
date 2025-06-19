import { testRule } from "../../utils/custom-test-rule";
import rule from "../../../src/rules/stacking-context/no-redundant-declaration";

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
      code: ".valid { position: relative; }",
      description: "positionだけでスタッキングコンテキストを生成しない",
    },
    {
      code: ".valid { position: relative; z-index: auto; isolation: isolate; }",
      description: "z-index: autoはスタッキングコンテキストを生成しない",
    },
    {
      code: ".valid { opacity: 1; isolation: isolate; }",
      description: "opacity: 1はスタッキングコンテキストを生成しない",
    },
    {
      code: ".valid { transform: none; isolation: isolate; }",
      description: "transform: noneはスタッキングコンテキストを生成しない",
    },
    {
      code: ".valid { filter: none; isolation: isolate; }",
      description: "filter: noneはスタッキングコンテキストを生成しない",
    },
  ],

  reject: [
    {
      code: ".invalid { position: relative; z-index: 1; isolation: isolate; }",
      description:
        "position: relativeとz-index: 1の組み合わせでスタッキングコンテキストが生成されるのでisolation: isolateは冗長",
      message:
        "冗長なisolation: isolateです。この要素のposition: relativeと併用されているz-index: 1プロパティが既に新しいスタッキングコンテキストを生成しています。",
      line: 1,
      column: 50,
    },
    {
      code: ".invalid { position: absolute; z-index: 0; isolation: isolate; }",
      description:
        "position: absoluteとz-index: 0の組み合わせでスタッキングコンテキストが生成されるのでisolation: isolateは冗長",
      message:
        "冗長なisolation: isolateです。この要素のposition: absoluteと併用されているz-index: 0プロパティが既に新しいスタッキングコンテキストを生成しています。",
      line: 1,
      column: 50,
    },
    {
      code: ".invalid { position: fixed; z-index: -1; isolation: isolate; }",
      description:
        "position: fixedとz-index: -1の組み合わせでスタッキングコンテキストが生成されるのでisolation: isolateは冗長",
      message:
        "冗長なisolation: isolateです。この要素のposition: fixedと併用されているz-index: -1プロパティが既に新しいスタッキングコンテキストを生成しています。",
      line: 1,
      column: 49,
    },
    {
      code: ".invalid { position: sticky; z-index: 10; isolation: isolate; }",
      description:
        "position: stickyとz-index: 10の組み合わせでスタッキングコンテキストが生成されるのでisolation: isolateは冗長",
      message:
        "冗長なisolation: isolateです。この要素のposition: stickyと併用されているz-index: 10プロパティが既に新しいスタッキングコンテキストを生成しています。",
      line: 1,
      column: 50,
    },
    {
      code: ".invalid { opacity: 0.5; isolation: isolate; }",
      description:
        "opacity: 0.5はスタッキングコンテキストを生成するのでisolation: isolateは冗長",
      message:
        "冗長なisolation: isolateです。この要素のopacity: 0.5プロパティが既に新しいスタッキングコンテキストを生成しています。",
      line: 1,
      column: 28,
    },
    {
      code: ".invalid { transform: translateX(10px); isolation: isolate; }",
      description:
        "transform: translateX(10px)はスタッキングコンテキストを生成するのでisolation: isolateは冗長",
      message:
        "冗長なisolation: isolateです。この要素のtransform: translateX(10px)プロパティが既に新しいスタッキングコンテキストを生成しています。",
      line: 1,
      column: 45,
    },
    {
      code: ".invalid { filter: blur(5px); isolation: isolate; }",
      description:
        "filter: blur(5px)はスタッキングコンテキストを生成するのでisolation: isolateは冗長",
      message:
        "冗長なisolation: isolateです。この要素のfilter: blur(5px)プロパティが既に新しいスタッキングコンテキストを生成しています。",
      line: 1,
      column: 34,
    },
    {
      code: ".invalid { mix-blend-mode: multiply; isolation: isolate; }",
      description:
        "mix-blend-mode: multiplyはスタッキングコンテキストを生成するのでisolation: isolateは冗長",
      message:
        "冗長なisolation: isolateです。この要素のmix-blend-mode: multiplyプロパティが既に新しいスタッキングコンテキストを生成しています。",
      line: 1,
      column: 41,
    },
    {
      code: ".invalid { contain: layout; isolation: isolate; }",
      description:
        "contain: layoutはスタッキングコンテキストを生成するのでisolation: isolateは冗長",
      message:
        "冗長なisolation: isolateです。この要素のcontain: layoutプロパティが既に新しいスタッキングコンテキストを生成しています。",
      line: 1,
      column: 33,
    },
    {
      code: ".invalid { will-change: opacity; isolation: isolate; }",
      description:
        "will-change: opacityはスタッキングコンテキストを生成するのでisolation: isolateは冗長",
      message:
        "冗長なisolation: isolateです。この要素のwill-change: opacityプロパティが既に新しいスタッキングコンテキストを生成しています。",
      line: 1,
      column: 38,
    },
  ],
});
