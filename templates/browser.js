import { ESLintConfigBuilder, filePatterns } from '@tomaschochola/tooling-eslint';

// eslint-disable-next-line no-restricted-exports
export default new ESLintConfigBuilder()
  .addNodeGlobalsForConfigFiles()
  .addBrowserGlobals()
  .addGlobalIgnores(filePatterns.defaultIgnorePatterns)
  .addGlobalIgnores(['node_modules'])
  .addJavaScriptRecommendedRules()
  .addJavaScriptPolicyRules()
  .addStylisticCustomizedRules()
  .addStylisticPolicyRules()
  .disableStylisticLegacyRules()
  .addSonarJsRecommendedRules()
  .addSonarJsPolicyOverrides()
  .toConfig();
