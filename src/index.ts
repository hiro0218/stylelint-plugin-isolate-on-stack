import stylelint from "stylelint";
import noRedundantDeclarationRule from "./rules/stacking-context/no-redundant-declaration.js";
import ineffectiveOnBackgroundBlendRule from "./rules/stacking-context/ineffective-on-background-blend.js";

const namespace = "stylelint-plugin-isolate-on-stack";
const noRedundantDeclaration = stylelint.createPlugin(
  `${namespace}/no-redundant-declaration`,
  noRedundantDeclarationRule,
);

const ineffectiveOnBackgroundBlend = stylelint.createPlugin(
  `${namespace}/ineffective-on-background-blend`,
  ineffectiveOnBackgroundBlendRule,
);

const plugins = [noRedundantDeclaration, ineffectiveOnBackgroundBlend];

export default plugins;

export {
  noRedundantDeclarationRule as noRedundantDeclaration,
  ineffectiveOnBackgroundBlendRule as ineffectiveOnBackgroundBlend,
};
