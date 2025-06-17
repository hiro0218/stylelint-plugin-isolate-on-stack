import stylelint from "stylelint";

const ruleName = "isolate-on-stack/isolation-for-position-zindex";
const messages = stylelint.utils.ruleMessages(ruleName, {
  expected:
    "Expected 'isolation: isolate' when using 'position' with a stacking value and 'z-index'.",
  fixed: "'isolation: isolate' was automatically added.",
  redundant:
    "'isolation: isolate' has no effect on pseudo-elements and should be removed.",
});

const CSS = Object.freeze({
  POSITION_KEY: "position",
  POSITION_STACKING_VALUES: ["absolute", "relative", "fixed", "sticky"],
  Z_INDEX_KEY: "z-index",
  ISOLATION_KEY: "isolation",
  ISOLATION_VALUE_ISOLATE: "isolate",
});

// 疑似要素のパターン
const pseudoElementPattern = /(::|:)(before|after|first-line|first-letter|marker|placeholder|selection|backdrop|cue|part|slotted)/;

const plugin = stylelint.createPlugin(
  ruleName,
  function (primaryOption, secondaryOptions, context) {
    return function (root, result) {
      const positionKey = CSS.POSITION_KEY;
      const stackingValues = CSS.POSITION_STACKING_VALUES;
      const zIndexKey = CSS.Z_INDEX_KEY;
      const isolationKey = CSS.ISOLATION_KEY;
      const isolateValue = CSS.ISOLATION_VALUE_ISOLATE;

      root.walkRules((rule) => {
        // ノードが存在しない場合はスキップ
        if (!rule.nodes) {
          return;
        }

        // セレクタがカンマで区切られている場合は分割して処理
        const selectors = rule.selector.split(',').map(s => s.trim());
        // すべてのセレクタが疑似要素である場合はtrueになる
        const isAllPseudoElements = selectors.length > 0 && selectors.every(selector => selector.match(pseudoElementPattern));

        let hasPositionStacking = false;
        let hasZIndex = false;
        let hasIsolationIsolate = false;
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
            prop === isolationKey
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
                stylelint.utils.report({
                  message: messages.expected,
                  node: item.node, // 各z-index: auto以外の宣言ノードにエラーを表示
                  result,
                  ruleName,
                });
              }
            } else {
              // z-index宣言が見つからない場合（通常ありえないが念のため）
              stylelint.utils.report({
                message: messages.expected,
                node: rule, // ルール全体にエラーを表示
                result,
                ruleName,
              });
            }
          }
        }
      });
    };
  },
);

plugin.ruleName = ruleName;
plugin.messages = messages;

export default plugin;
