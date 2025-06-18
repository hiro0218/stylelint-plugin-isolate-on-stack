import stylelint from "stylelint";

const ruleName = "isolate-on-stack/isolation-for-position-zindex";
const messages = stylelint.utils.ruleMessages(ruleName, {
  expected:
    "Expected 'isolation: isolate' when using 'position' with a stacking value and 'z-index'.",
  fixed: "'isolation: isolate' was automatically added.",
  redundant:
    "'isolation: isolate' has no effect on pseudo-elements and should be removed.",
  redundantStackingContext:
    "'isolation: isolate' is redundant because a stacking context already exists due to other properties.",
});

const CSS = Object.freeze({
  POSITION_KEY: "position",
  POSITION_STACKING_VALUES: ["absolute", "relative", "fixed", "sticky"],
  Z_INDEX_KEY: "z-index",
  ISOLATION_KEY: "isolation",
  ISOLATION_VALUE_ISOLATE: "isolate",
  // スタッキングコンテキストを作成するプロパティ
  STACKING_CONTEXT_PROPS: {
    OPACITY: "opacity",
    TRANSFORM: "transform",
    FILTER: "filter",
    BACKDROP_FILTER: "backdrop-filter",
    PERSPECTIVE: "perspective",
    CLIP_PATH: "clip-path",
    MASK: "mask",
    MASK_IMAGE: "mask-image",
    MASK_BORDER: "mask-border",
    MIX_BLEND_MODE: "mix-blend-mode",
    WILL_CHANGE: "will-change",
  },
  // will-changeで指定された場合にスタッキングコンテキストを作成する値
  WILL_CHANGE_STACKING_VALUES: [
    "opacity",
    "transform",
    "filter",
    "backdrop-filter",
    "perspective",
    "clip-path",
    "mask",
    "mask-image",
    "mask-border",
    "mix-blend-mode"
  ],
});

// 疑似要素のパターン
const PSEUDO_ELEMENT_PATTERN = /(::|:)(before|after|first-letter|first-line|selection|backdrop|placeholder|marker|spelling-error|grammar-error)/;

const plugin = stylelint.createPlugin(
  ruleName,
  function (primaryOption, secondaryOptions, context) {
    return function (root, result) {
      const positionKey = CSS.POSITION_KEY;
      const stackingValues = CSS.POSITION_STACKING_VALUES;
      const zIndexKey = CSS.Z_INDEX_KEY;
      const isolationKey = CSS.ISOLATION_KEY;
      const isolateValue = CSS.ISOLATION_VALUE_ISOLATE;
      const stackingContextProps = CSS.STACKING_CONTEXT_PROPS;
      const willChangeStackingValues = CSS.WILL_CHANGE_STACKING_VALUES;

      // オプション設定
      const ignoreWhenStackingContextExists = secondaryOptions?.ignoreWhenStackingContextExists || false;
      const ignoreClasses = Array.isArray(secondaryOptions?.ignoreClasses)
        ? secondaryOptions.ignoreClasses
        : [];

      root.walkRules((rule) => {
        // ノードが存在しない場合はスキップ
        if (!rule.nodes) {
          return;
        }

        // セレクタがカンマで区切られている場合は分割して処理
        const selectors = rule.selector.split(',').map(s => s.trim());
        // すべてのセレクタが疑似要素である場合はtrueになる
        const isAllPseudoElements = selectors.length > 0 && selectors.every(selector => selector.match(PSEUDO_ELEMENT_PATTERN));

        // 無視すべきクラスが含まれているかチェック
        const shouldIgnoreByClass = ignoreClasses.length > 0 && selectors.some(selector => {
          return ignoreClasses.some(ignoreClass => {
            // クラス名が含まれているかチェック
            const classPattern = new RegExp(`\\.${ignoreClass}(\\s|$|:|::|\\.)`);
            return classPattern.test(selector);
          });
        });

        // 前後のコメントを検索してdisableコメントをチェック
        // 注: Stylelintの標準機能がコメント無効化を処理するため、ここでは常にfalseになる
        const hasDisableComment = false;

        // 無視すべき場合はスキップ
        if (shouldIgnoreByClass || hasDisableComment) {
          return;
        }

        let hasPositionStacking = false;
        let hasZIndex = false;
        let hasIsolationIsolate = false;
        let hasOtherStackingContext = false;
        let lastZIndexDecl = null;
        let nonAutoZIndexItems = [];

        // 宣言を収集
        const declMap = new Map();

        // 関連宣言を収集
        rule.walkDecls((decl) => {
          const prop = decl.prop.toLowerCase();

          if (
            prop === positionKey ||
            prop === zIndexKey ||
            prop === isolationKey ||
            prop === stackingContextProps.OPACITY ||
            prop === stackingContextProps.TRANSFORM ||
            prop === stackingContextProps.FILTER ||
            prop === stackingContextProps.BACKDROP_FILTER ||
            prop === stackingContextProps.PERSPECTIVE ||
            prop === stackingContextProps.CLIP_PATH ||
            prop === stackingContextProps.MASK ||
            prop === stackingContextProps.MASK_IMAGE ||
            prop === stackingContextProps.MASK_BORDER ||
            prop === stackingContextProps.MIX_BLEND_MODE ||
            prop === stackingContextProps.WILL_CHANGE
          ) {
            if (!declMap.has(prop)) {
              declMap.set(prop, []);
            }
            declMap.get(prop).push({
              value: decl.value.toLowerCase(),
              node: decl,
            });
          }
        });

        // 各プロパティの検証
        if (declMap.has(positionKey)) {
          for (const item of declMap.get(positionKey)) {
            if (stackingValues.includes(item.value)) {
              hasPositionStacking = true;
              break;
            }
          }
        }

        if (declMap.has(zIndexKey)) {
          // z-index: auto 以外の宣言を収集
          const zItems = declMap.get(zIndexKey);

          for (const item of zItems) {
            if (item.value !== "auto") {
              hasZIndex = true;
              nonAutoZIndexItems.push(item);
              // 最後のz-index宣言をautofix用に保存（複数ある場合は最後のものを使用）
              lastZIndexDecl = item.node;
            }
          }
        }

        if (declMap.has(isolationKey)) {
          for (const item of declMap.get(isolationKey)) {
            if (item.value === isolateValue) {
              hasIsolationIsolate = true;
              break;
            }
          }
        }

        // スタッキングコンテキストを作成する他のプロパティの検証
        if (declMap.has(stackingContextProps.OPACITY)) {
          for (const item of declMap.get(stackingContextProps.OPACITY)) {
            // opacityが1未満の場合はスタッキングコンテキスト
            if (parseFloat(item.value) < 1) {
              hasOtherStackingContext = true;
              break;
            }
          }
        }

        // transformが指定されている場合
        if (declMap.has(stackingContextProps.TRANSFORM) && declMap.get(stackingContextProps.TRANSFORM).length > 0) {
          // noneでなければスタッキングコンテキスト
          const transformItems = declMap.get(stackingContextProps.TRANSFORM);
          if (transformItems.some(item => item.value !== "none")) {
            hasOtherStackingContext = true;
          }
        }

        // filterが指定されている場合
        if (declMap.has(stackingContextProps.FILTER) && declMap.get(stackingContextProps.FILTER).length > 0) {
          // noneでなければスタッキングコンテキスト
          const filterItems = declMap.get(stackingContextProps.FILTER);
          if (filterItems.some(item => item.value !== "none")) {
            hasOtherStackingContext = true;
          }
        }

        // backdrop-filterが指定されている場合
        if (declMap.has(stackingContextProps.BACKDROP_FILTER) && declMap.get(stackingContextProps.BACKDROP_FILTER).length > 0) {
          // noneでなければスタッキングコンテキスト
          const backdropFilterItems = declMap.get(stackingContextProps.BACKDROP_FILTER);
          if (backdropFilterItems.some(item => item.value !== "none")) {
            hasOtherStackingContext = true;
          }
        }

        // perspectiveが指定されている場合
        if (declMap.has(stackingContextProps.PERSPECTIVE) && declMap.get(stackingContextProps.PERSPECTIVE).length > 0) {
          // noneでなければスタッキングコンテキスト
          const perspectiveItems = declMap.get(stackingContextProps.PERSPECTIVE);
          if (perspectiveItems.some(item => item.value !== "none")) {
            hasOtherStackingContext = true;
          }
        }

        // clip-pathが指定されている場合
        if (declMap.has(stackingContextProps.CLIP_PATH) && declMap.get(stackingContextProps.CLIP_PATH).length > 0) {
          // noneでなければスタッキングコンテキスト
          const clipPathItems = declMap.get(stackingContextProps.CLIP_PATH);
          if (clipPathItems.some(item => item.value !== "none")) {
            hasOtherStackingContext = true;
          }
        }

        // maskが指定されている場合
        if (declMap.has(stackingContextProps.MASK) && declMap.get(stackingContextProps.MASK).length > 0) {
          // noneでなければスタッキングコンテキスト
          const maskItems = declMap.get(stackingContextProps.MASK);
          if (maskItems.some(item => item.value !== "none")) {
            hasOtherStackingContext = true;
          }
        }

        // mask-imageが指定されている場合
        if (declMap.has(stackingContextProps.MASK_IMAGE) && declMap.get(stackingContextProps.MASK_IMAGE).length > 0) {
          // noneでなければスタッキングコンテキスト
          const maskImageItems = declMap.get(stackingContextProps.MASK_IMAGE);
          if (maskImageItems.some(item => item.value !== "none")) {
            hasOtherStackingContext = true;
          }
        }

        // mask-borderが指定されている場合
        if (declMap.has(stackingContextProps.MASK_BORDER) && declMap.get(stackingContextProps.MASK_BORDER).length > 0) {
          // noneでなければスタッキングコンテキスト
          const maskBorderItems = declMap.get(stackingContextProps.MASK_BORDER);
          if (maskBorderItems.some(item => item.value !== "none")) {
            hasOtherStackingContext = true;
          }
        }

        // mix-blend-modeが指定されている場合
        if (declMap.has(stackingContextProps.MIX_BLEND_MODE) && declMap.get(stackingContextProps.MIX_BLEND_MODE).length > 0) {
          // normalでなければスタッキングコンテキスト
          const mixBlendModeItems = declMap.get(stackingContextProps.MIX_BLEND_MODE);
          if (mixBlendModeItems.some(item => item.value !== "normal")) {
            hasOtherStackingContext = true;
          }
        }

        // will-changeが指定されている場合
        if (declMap.has(stackingContextProps.WILL_CHANGE) && declMap.get(stackingContextProps.WILL_CHANGE).length > 0) {
          const willChangeItems = declMap.get(stackingContextProps.WILL_CHANGE);
          // will-changeにスタッキングコンテキストを作成するプロパティが含まれていればtrue
          if (willChangeItems.some(item => {
            const values = item.value.split(',').map(v => v.trim());
            return values.some(value => willChangeStackingValues.includes(value));
          })) {
            hasOtherStackingContext = true;
          }
        }

        // 条件判定と修正
        if (isAllPseudoElements && hasIsolationIsolate) {
          // すべてのセレクタが疑似要素であり、isolation: isolateが指定されている場合は警告を出す
          const isolationItem = declMap.get(isolationKey).find(item => item.value === isolateValue);
          // findの結果が存在することを確認してからnodeプロパティにアクセス
          if (isolationItem) {
            stylelint.utils.report({
              message: messages.redundant,
              node: isolationItem.node, // isolationプロパティ自体を指し示す
              result,
              ruleName,
            });
          }
        } else if (hasPositionStacking && hasZIndex && !hasIsolationIsolate && !isAllPseudoElements) {
          // すでに他のプロパティによりスタッキングコンテキストが作成されている場合は警告を出さない
          if (ignoreWhenStackingContextExists && hasOtherStackingContext) {
            return;
          }

          // 疑似要素のみの場合（isAllPseudoElements=true）は何も警告を出さない
          if (context && context.fix && lastZIndexDecl) {
            // 自動修正を適用
            // 最後のz-index宣言の後ろにisolation: isolateを挿入
            rule.insertAfter(lastZIndexDecl, {
              prop: isolationKey,
              value: isolateValue,
            });
          } else {
            // 通常のセレクタが少なくとも1つ含まれる場合のみエラーメッセージを表示
            // すべてのz-index: auto以外の宣言に対して警告を表示
            if (nonAutoZIndexItems && nonAutoZIndexItems.length > 0) {
              for (const item of nonAutoZIndexItems) {
                const selectors = item.node.parent.selector.split(',').map(s => s.trim());
                const hasNormalSelector = selectors.some(selector => !PSEUDO_ELEMENT_PATTERN.test(selector));

                if (!hasNormalSelector) {
                  // すべて疑似要素の場合はエラーメッセージを表示しない
                  continue;
                }

                stylelint.utils.report({
                  message: messages.expected,
                  node: item.node, // 各z-index: auto以外の宣言ノードにエラーを表示
                  result,
                  ruleName,
                });
              }
            } else {
              const selectors = rule.selector.split(',').map(s => s.trim());
              const hasNormalSelector = selectors.some(selector => !PSEUDO_ELEMENT_PATTERN.test(selector));

              if (hasNormalSelector) {
                // 通常のセレクタが含まれる場合のみエラーメッセージを表示
                stylelint.utils.report({
                  message: messages.expected,
                  node: rule, // ルール全体にエラーを表示
                  result,
                  ruleName,
                });
              }
            }
          }
        } else if (hasIsolationIsolate && hasOtherStackingContext && ignoreWhenStackingContextExists) {
          // isolation: isolateが指定されているが、すでに他のプロパティによりスタッキングコンテキストが作成されている場合
          const isolationItem = declMap.get(isolationKey).find(item => item.value === isolateValue);
          if (isolationItem) {
            stylelint.utils.report({
              message: messages.redundantStackingContext,
              node: isolationItem.node,
              result,
              ruleName,
            });
          }
        }
      });
    };
  },
);

plugin.ruleName = ruleName;
plugin.messages = messages;

export default plugin;
