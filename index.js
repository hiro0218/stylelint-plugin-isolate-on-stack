import stylelint from "stylelint";

const ruleName = "isolate-on-stack/isolation-for-absolute-zindex";
const messages = stylelint.utils.ruleMessages(ruleName, {
    expected: "Expected 'isolation: isolate' when using 'position: absolute' and 'z-index'.",
    fixed: "'isolation: isolate' was automatically added.",
});

const plugin = stylelint.createPlugin(ruleName, function (primaryOption, secondaryOptions, context) {
    return function (root, result) {
        root.walkRules(rule => {
            let hasPositionAbsolute = false;
            let hasZIndex = false;
            let hasIsolationIsolate = false;
            let lastZIndexDecl = null;

            rule.walkDecls(decl => {
                const prop = decl.prop.toLowerCase();
                const value = decl.value.toLowerCase();

                if (prop === "position" && value === "absolute") {
                    hasPositionAbsolute = true;
                }
                if (prop === "z-index") {
                    hasZIndex = true;
                    lastZIndexDecl = decl; // autofix用
                }
                if (prop === "isolation" && value === "isolate") {
                    hasIsolationIsolate = true;
                }
            });

            if (hasPositionAbsolute && hasZIndex && !hasIsolationIsolate) {
                if (context && context.fix && lastZIndexDecl) {
                    // autofix: isolation: isolate を z-index の直後に追加
                    rule.insertAfter(lastZIndexDecl, { prop: "isolation", value: "isolate" });
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
});

plugin.ruleName = ruleName;
plugin.messages = messages;

export default plugin;
