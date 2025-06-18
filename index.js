import stylelint from "stylelint";

const ruleName = "isolate-on-stack/no-redundant-declaration";
const messages = stylelint.utils.ruleMessages(ruleName, {
  redundantStackingContext:
    "'isolation: isolate' is redundant because a stacking context already exists due to other properties.",
  ineffectiveOnBackgroundBlend:
    "'isolation: isolate' has no effect on 'background-blend-mode' and should be removed.",
  redundant:
    "'isolation: isolate' has no effect on pseudo-elements and should be removed.",
  expected:
    "Expected 'isolation: isolate' to be specified when creating a stacking context with position and z-index.",
  expectedRequired:
    "This selector requires 'isolation: isolate' to properly isolate the stacking context."
});

const CSS = Object.freeze({
  POSITION_KEY: "position",
  POSITION_STACKING_VALUES: ["absolute", "relative", "fixed", "sticky"],
  Z_INDEX_KEY: "z-index",
  ISOLATION_KEY: "isolation",
  ISOLATION_VALUE_ISOLATE: "isolate",
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
    BACKGROUND_BLEND_MODE: "background-blend-mode",
    WILL_CHANGE: "will-change",
  },
  // Values that create stacking contexts when specified in will-change
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
  ]
});

// Pseudo-element pattern
const PSEUDO_ELEMENT_PATTERN = /(::|:)(before|after|first-letter|first-line|selection|backdrop|placeholder|marker|spelling-error|grammar-error)/;

// 疑似要素の中でもスタッキングコンテキストが許可されているもの
const STACKING_ALLOWED_PSEUDO_ELEMENTS = ["first-letter", "first-line", "marker"];

const plugin = stylelint.createPlugin(
  ruleName,
  function (primaryOption, secondaryOptions = {}) {
    return function (root, result) {
      const isolationKey = CSS.ISOLATION_KEY;
      const isolateValue = CSS.ISOLATION_VALUE_ISOLATE;
      const stackingContextProps = CSS.STACKING_CONTEXT_PROPS;
      const willChangeStackingValues = CSS.WILL_CHANGE_STACKING_VALUES;

      // カスタムオプションの処理
      const ignoreWhenStackingContextExists = secondaryOptions.ignoreWhenStackingContextExists || false;
      const ignoreSelectors = secondaryOptions.ignoreSelectors || [];
      const ignoreElements = secondaryOptions.ignoreElements || [];
      const ignoreClasses = secondaryOptions.ignoreClasses || [];
      const requireClasses = secondaryOptions.requireClasses || [];

      // セレクタが無視すべきか判定する関数
      const shouldIgnoreSelector = (selector) => {
        // 正規表現パターンが合致する場合は無視
        if (ignoreSelectors.some(pattern => new RegExp(pattern).test(selector))) {
          return true;
        }

        // 要素名が無視リストに含まれる場合は無視
        if (ignoreElements.some(element => {
          const elementPattern = new RegExp(`^${element}(\\s|$|[.#:[])`);
          return elementPattern.test(selector);
        })) {
          return true;
        }

        // クラス名が無視リストに含まれる場合は無視
        if (ignoreClasses.some(className => {
          const classPattern = new RegExp(`\\.${className}(\\s|$|[.#:[])`);
          return classPattern.test(selector);
        })) {
          return true;
        }

        return false;
      };

      // セレクタがisolation: isolateを必須とするか判定する関数
      const requiresIsolation = (selector) => {
        return requireClasses.some(className => {
          const classPattern = new RegExp(`\\.${className}(\\s|$|[.#:[])`);
          return classPattern.test(selector);
        });
      };

      root.walkRules((rule) => {
        // ノードが存在しない場合はスキップ
        if (!rule.nodes) {
          return;
        }

        // セレクタがカンマで区切られている場合は分割して処理
        const selectors = rule.selector.split(',').map(s => s.trim());

        // すべてのセレクタが無視リストに含まれている場合はスキップ
        if (selectors.every(selector => shouldIgnoreSelector(selector))) {
          return;
        }

        // すべてのセレクタが疑似要素である場合はtrueになる
        const isAllPseudoElements = selectors.length > 0 && selectors.every(selector => {
          const match = selector.match(PSEUDO_ELEMENT_PATTERN);
          if (!match) return false;

          // 疑似要素の種類を取得
          const pseudoType = match[2];
          // スタッキングコンテキストが許可されていない疑似要素かどうかをチェック
          return !STACKING_ALLOWED_PSEUDO_ELEMENTS.includes(pseudoType.toLowerCase());
        });

        let hasIsolationIsolate = false;
        let hasOtherStackingContext = false;
        let hasBackgroundBlendMode = false;
        let hasPositionZIndex = false;

        // 宣言を収集
        const declMap = new Map();

        // 関連宣言を収集
        rule.walkDecls((decl) => {
          const prop = decl.prop.toLowerCase();

          if (
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
            prop === stackingContextProps.BACKGROUND_BLEND_MODE ||
            prop === stackingContextProps.WILL_CHANGE ||
            prop === CSS.POSITION_KEY ||
            prop === CSS.Z_INDEX_KEY
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

        // isolation: isolateの検証
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

        // background-blend-modeが指定されている場合 - isolationとの無効な組み合わせを検出
        if (declMap.has(stackingContextProps.BACKGROUND_BLEND_MODE) && declMap.get(stackingContextProps.BACKGROUND_BLEND_MODE).length > 0) {
          const backgroundBlendModeItems = declMap.get(stackingContextProps.BACKGROUND_BLEND_MODE);
          if (backgroundBlendModeItems.some(item => item.value !== "normal")) {
            hasBackgroundBlendMode = true;
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

        // position + z-indexの組み合わせがあるかチェック
        if (declMap.has(CSS.POSITION_KEY) && declMap.has(CSS.Z_INDEX_KEY)) {
          const positionItems = declMap.get(CSS.POSITION_KEY);
          const zIndexItems = declMap.get(CSS.Z_INDEX_KEY);

          // positionがスタッキングコンテキストを生成する値かつz-indexがauto以外の場合
          if (positionItems.some(item => CSS.POSITION_STACKING_VALUES.includes(item.value)) &&
            zIndexItems.some(item => item.value !== "auto")) {
            hasOtherStackingContext = true;
            hasPositionZIndex = true;
          }
        }

        // isolation: isolateが必須なセレクタがあるかチェック
        const hasRequiredSelector = selectors.some(selector => requiresIsolation(selector));

        // 条件判定
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
        } else if (hasIsolationIsolate && hasOtherStackingContext) {
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
        } else if (hasIsolationIsolate && hasBackgroundBlendMode) {
          // isolation: isolateとbackground-blend-modeが併用されている場合（無効な組み合わせ）
          const isolationItem = declMap.get(isolationKey).find(item => item.value === isolateValue);
          if (isolationItem) {
            stylelint.utils.report({
              message: messages.ineffectiveOnBackgroundBlend,
              node: isolationItem.node,
              result,
              ruleName,
            });
          }
        } else if (hasPositionZIndex && !hasIsolationIsolate && !ignoreWhenStackingContextExists) {
          // position + z-indexでスタッキングコンテキストを作成しているが、isolation: isolateがない場合
          // かつignoreWhenStackingContextExistsオプションがfalseの場合

          // 以前のルールではここで警告を出していたが、現在のルールでは出さない
          // 無視すべきでないセレクタがある場合のみ警告
          /*
          const nonIgnoredSelectors = selectors.filter(selector => !shouldIgnoreSelector(selector));
          if (nonIgnoredSelectors.length > 0) {
            const firstPositionDecl = declMap.get(CSS.POSITION_KEY)[0].node;
            stylelint.utils.report({
              message: messages.expected,
              node: firstPositionDecl,
              result,
              ruleName,
            });
          }
          */
        } else if (hasRequiredSelector && !hasIsolationIsolate) {
          // isolation: isolateが必須なセレクタがあるが、isolation: isolateが指定されていない場合
          stylelint.utils.report({
            message: messages.expectedRequired,
            node: rule,
            result,
            ruleName,
          });
        }
      });
    };
  },
);

plugin.ruleName = ruleName;
plugin.messages = messages;

export default plugin;
