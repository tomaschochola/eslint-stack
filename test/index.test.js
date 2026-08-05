/**
 * @file
 * @author Tomáš Chochola <tomaschochola@tomaschochola.cz>
 * @copyright © 2026 Tomáš Chochola <tomaschochola@tomaschochola.cz>
 *
 * @license CC-BY-ND-4.0
 *
 * @see {@link https://creativecommons.org/licenses/by-nd/4.0/} License
 * @see {@link https://github.com/tomaschochola} GitHub Profile
 * @see {@link https://github.com/sponsors/tomaschochola} GitHub Sponsors
 */

import { ESLint } from 'eslint';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import assert from 'node:assert/strict';
import test from 'node:test';
import { ESLintConfigBuilder, filePatterns } from '../src/index.js';

const lintText = async (builder, code, filePath) => {
  const eslint = new ESLint({
    overrideConfig: builder.toConfig(),
    overrideConfigFile: true,
  });

  const [result] = await eslint.lintText(code, { filePath });

  return result;
};

test('file patterns are immutable', () => {
  assert.equal(Object.isFrozen(filePatterns), true);
  assert.deepEqual(filePatterns.allTypeScriptDeclarationFiles, ['**/*.d.cts', '**/*.d.mts', '**/*.d.ts', '**/*.d.*.ts']);

  for (const patterns of Object.values(filePatterns)) {
    assert.equal(Object.isFrozen(patterns), true);
  }
});

test('JavaScript policy rejects default exports and accepts named exports', async () => {
  const builder = new ESLintConfigBuilder()
    .addNodeGlobals()
    .addJavaScriptRecommendedRules()
    .addJavaScriptPolicyRules();

  const accepted = await lintText(builder, 'export const answer = process.exitCode ?? 42;\n', 'src/accepted.js');
  const rejected = await lintText(builder, 'export default 42;\n', 'src/rejected.js');

  assert.equal(accepted.errorCount, 0);
  assert.deepEqual(rejected.messages.map(({ ruleId }) => ruleId), ['no-restricted-exports']);
});

test('policy rules can be overridden explicitly', async () => {
  const result = await lintText(
    new ESLintConfigBuilder()
      .addJavaScriptRecommendedRules()
      .addJavaScriptPolicyRules({ rules: { 'no-restricted-exports': 'off' } }),
    'export default 42;\n',
    'src/index.js',
  );

  assert.equal(result.errorCount, 0);
});

test('declaration-file overrides cover every TypeScript declaration extension', async () => {
  const eslint = new ESLint({
    overrideConfig: new ESLintConfigBuilder()
      .addJavaScriptPolicyRules()
      .addRawConfig({
        files: filePatterns.allTypeScriptDeclarationFiles,
        rules: {
          'no-restricted-exports': 'off',
        },
      })
      .toConfig(),
    overrideConfigFile: true,
  });

  for (const filePath of ['types/index.d.cts', 'types/index.d.mts', 'types/index.d.ts', 'types/index.d.generated.ts']) {
    const config = await eslint.calculateConfigForFile(filePath);

    assert.equal(config.rules['no-restricted-exports'][0], 0);
  }
});

test('browser globals are available only when requested', async () => {
  const withoutBrowserGlobals = await lintText(
    new ESLintConfigBuilder().addJavaScriptRecommendedRules(),
    'document.title = "test";\n',
    'src/browser.js',
  );

  const withBrowserGlobals = await lintText(
    new ESLintConfigBuilder().addBrowserGlobals().addJavaScriptRecommendedRules(),
    'document.title = "test";\n',
    'src/browser.js',
  );

  assert.deepEqual(withoutBrowserGlobals.messages.map(({ ruleId }) => ruleId), ['no-undef']);
  assert.equal(withBrowserGlobals.errorCount, 0);
});

test('Git ignore files and explicit global ignores are honored', async () => {
  const eslint = new ESLint({
    overrideConfig: new ESLintConfigBuilder()
      .addGitIgnoreFile(new URL('../eslint.config.js', import.meta.url))
      .addGlobalIgnores(['generated'])
      .toConfig(),
    overrideConfigFile: true,
  });

  assert.equal(await eslint.isPathIgnored('node_modules/package/index.js'), true);
  assert.equal(await eslint.isPathIgnored('generated/index.js'), true);
  assert.equal(await eslint.isPathIgnored('src/index.js'), false);
});

test('raw configuration, configuration-file globals, project service, and type-check disabling compose', async () => {
  const typescriptFiles = filePatterns.allTypeScriptFiles;
  const javascriptFiles = filePatterns.allJavaScriptFiles;

  const eslint = new ESLint({
    overrideConfig: new ESLintConfigBuilder()
      .addNodeGlobalsForConfigFiles()
      .addRawConfig({ rules: { eqeqeq: 'error' } })
      .addTypeScriptStrictTypeCheckedRules({ files: typescriptFiles })
      .enableTypeScriptProjectService({ files: typescriptFiles })
      .disableTypeScriptTypeChecking({ files: javascriptFiles })
      .toConfig(),
    overrideConfigFile: true,
  });

  const [configFileResult] = await eslint.lintText('process.exitCode = value == null ? 0 : 1;\n', { filePath: 'eslint.config.js' });
  const typescriptConfig = await eslint.calculateConfigForFile('src/index.ts');

  assert.deepEqual(configFileResult.messages.map(({ ruleId }) => ruleId), ['eqeqeq']);
  assert.equal(typescriptConfig.languageOptions.parserOptions.projectService, true);
});

test('TypeScript, React, accessibility, hooks, stylistic, and Sonar configurations compose', async (context) => {
  const directory = await mkdtemp(join(tmpdir(), 'tooling-eslint-'));

  context.after(async () => {
    await rm(directory, {
      force: true,
      recursive: true,
    });
  });

  const tsconfig = join(directory, 'tsconfig.json');

  await writeFile(tsconfig, JSON.stringify({
    compilerOptions: {
      jsx: 'react-jsx',
      module: 'NodeNext',
      moduleResolution: 'NodeNext',
      strict: true,
      target: 'ES2025',
    },
    files: ['sample.ts', 'sample.tsx'],
  }));
  await writeFile(join(directory, 'sample.ts'), 'export const answer = 42;\n');
  await writeFile(join(directory, 'sample.tsx'), 'export const component = <main>answer</main>;\n');

  const typescriptFiles = [...filePatterns.allTypeScriptFiles, ...filePatterns.allTsxFiles];
  const tsxFiles = filePatterns.allTsxFiles;

  const eslint = new ESLint({
    cwd: directory,
    overrideConfig: new ESLintConfigBuilder()
      .addBrowserGlobals()
      .addJavaScriptRecommendedRules()
      .addJavaScriptPolicyRules()
      .addTypeScriptStrictTypeCheckedRules({ files: typescriptFiles })
      .addTypeScriptStylisticTypeCheckedRules({ files: typescriptFiles })
      .enableTypeScriptProject({
        files: typescriptFiles,
        project: tsconfig,
      })
      .addTypeScriptPolicyRules({ files: typescriptFiles })
      .addReactRecommendedRules({ files: tsxFiles })
      .addReactJsxRuntimeRules({ files: tsxFiles })
      .addReactVersionDetection({ files: tsxFiles })
      .addReactPolicyRules({ files: tsxFiles })
      .addJsxAccessibilityStrictRules({ files: tsxFiles })
      .addJsxAccessibilityPolicyRules({ files: tsxFiles })
      .addReactHooksRecommendedLatestRules({ files: tsxFiles })
      .addStylisticCustomizedRules()
      .addStylisticPolicyRules()
      .disableStylisticLegacyRules()
      .addSonarJsRecommendedRules()
      .addSonarJsPolicyOverrides()
      .toConfig(),
    overrideConfigFile: true,
  });

  const typescriptConfig = await eslint.calculateConfigForFile(join(directory, 'sample.ts'));
  const tsxConfig = await eslint.calculateConfigForFile(join(directory, 'sample.tsx'));
  const [typescriptResult, tsxResult] = await eslint.lintFiles(['sample.ts', 'sample.tsx']);

  assert.equal(typescriptConfig.rules['@typescript-eslint/strict-boolean-expressions'][0], 2);
  assert.equal(typescriptConfig.rules['sonarjs/function-return-type'][0], 0);
  assert.equal(typescriptResult.errorCount, 0);
  assert.equal(tsxConfig.rules['react/jsx-no-script-url'][0], 2);
  assert.equal(tsxConfig.rules['jsx-a11y/lang'][0], 2);
  assert.equal(tsxConfig.rules['react-hooks/rules-of-hooks'][0], 2);
  assert.equal(tsxResult.fatalErrorCount, 0);
});
