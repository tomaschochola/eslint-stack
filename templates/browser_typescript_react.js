import { ESLintConfigBuilder, filePatterns } from '@tomaschochola/tooling-eslint';

const typescriptFiles = [...filePatterns.allTypeScriptFiles, ...filePatterns.allTsxFiles];
const javascriptFiles = [...filePatterns.allJavaScriptFiles, ...filePatterns.allJsxFiles];

// eslint-disable-next-line no-restricted-exports
export default new ESLintConfigBuilder()
  .addNodeGlobalsForConfigFiles()
  .addBrowserGlobals()
  .addGlobalIgnores(filePatterns.defaultIgnorePatterns)
  .addGlobalIgnores(['node_modules'])
  .addJavaScriptRecommendedRules()
  .addJavaScriptPolicyRules()
  .addTypeScriptStrictTypeCheckedRules({ files: typescriptFiles })
  .addTypeScriptStylisticTypeCheckedRules({ files: typescriptFiles })
  .enableTypeScriptProjectService({ files: typescriptFiles })
  .addTypeScriptPolicyRules({ files: typescriptFiles })
  .disableTypeScriptTypeChecking({ files: javascriptFiles })
  .addReactRecommendedRules()
  .addReactJsxRuntimeRules()
  .addReactVersionDetection()
  .addReactPolicyRules()
  .addJsxAccessibilityStrictRules()
  .addJsxAccessibilityPolicyRules()
  .addReactHooksRecommendedLatestRules()
  .addStylisticCustomizedRules()
  .addStylisticPolicyRules()
  .disableStylisticLegacyRules()
  .addSonarJsRecommendedRules()
  .addSonarJsPolicyOverrides()
  .toConfig();
