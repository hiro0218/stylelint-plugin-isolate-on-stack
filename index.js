import stylelint from "stylelint";

const ruleName = "isolate-on-stack/isolation-for-absolute-zindex";
const messages = stylelint.utils.ruleMessages(ruleName, {
  expected:
    "Expected 'isolation: isolate' when using 'position: absolute' and 'z-index'.",
  fixed: "'isolation: isolate' was automatically added.",
});

const CSS = Object.freeze({
  POSITION_KEY: "position",
  POSITION_VALUE_ABSOLUTE: "absolute",
  Z_INDEX_KEY: "z-index",
  ISOLATION_KEY: "isolation",
  ISOLATION_VALUE_ISOLATE: "isolate",
});

const plugin = stylelint.createPlugin(
  ruleName,
  function (primaryOption, secondaryOptions, context) {
    return function (root, result) {
      const positionKey = CSS.POSITION_KEY;
      const absoluteValue = CSS.POSITION_VALUE_ABSOLUTE;
      const zIndexKey = CSS.Z_INDEX_KEY;
      const isolationKey = CSS.ISOLATION_KEY;
      const isolateValue = CSS.ISOLATION_VALUE_ISOLATE;

      root.walkRules((rule) => {
        // 宣言が不足している場合はスキップ
        if (!rule.nodes || rule.nodes.length < 2) {
          return;
        }

        let hasPositionAbsolute = false;
        let hasZIndex = false;
        let hasIsolationIsolate = false;
        let lastZIndexDecl = null;

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
            if (item.value === absoluteValue) {
              hasPositionAbsolute = true;
              break;
            }
          }
        }

        if (declMap.has(zIndexKey)) {
          hasZIndex = true;
          // autofix用の参照を保存
          const zItems = declMap.get(zIndexKey);
          lastZIndexDecl = zItems[zItems.length - 1].node;
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
        if (hasPositionAbsolute && hasZIndex && !hasIsolationIsolate) {
          if (context && context.fix && lastZIndexDecl) {
            rule.insertAfter(lastZIndexDecl, {
              prop: isolationKey,
              value: isolateValue,
            });
          } else {
            stylelint.utils.report({
              message: messages.expected,
              node: rule,
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
