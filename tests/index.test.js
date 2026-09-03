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
    assert.deepEqual(Object.keys(filePatterns), ['configurations', 'declarations', 'javascript', 'jsx', 'playwright', 'scripts', 'tsx', 'typescript']);
    assert.deepEqual(filePatterns.declarations, ['**/*.d.cts', '**/*.d.mts', '**/*.d.ts', '**/*.d.*.ts']);
    assert.deepEqual(filePatterns.playwright, ['playwright.config.cts', 'playwright.config.mts', 'playwright.config.ts', 'tests/**/*.cts', 'tests/**/*.mts', 'tests/**/*.ts', 'tests/**/*.tsx']);

    for (const patterns of Object.values(filePatterns)) {
        assert.equal(Object.isFrozen(patterns), true);
    }
});

test('browser globals are available only when requested', async () => {
    const withoutBrowserGlobals = await lintText(new ESLintConfigBuilder().addJavaScriptRecommendedRules(), 'document.title = "test";\n', 'src/browser.js');

    const withBrowserGlobals = await lintText(new ESLintConfigBuilder().addBrowserGlobals({ files: ['src/**/*.js'] }).addJavaScriptRecommendedRules(), 'document.title = "test";\n', 'src/browser.js');
    const configFile = await lintText(
        new ESLintConfigBuilder()
            .addNodeGlobalsForConfigFiles()
            .addBrowserGlobals({ files: ['src/**/*.js'] })
            .addJavaScriptRecommendedRules(),
        'document.title = process.env.NODE_ENV ?? "";\n',
        'eslint.config.js',
    );

    assert.deepEqual(
        withoutBrowserGlobals.messages.map(({ ruleId }) => ruleId),
        ['no-undef'],
    );
    assert.equal(withBrowserGlobals.errorCount, 0);
    assert.deepEqual(
        configFile.messages.map(({ ruleId }) => ruleId),
        ['no-undef'],
    );
});

test('file-scoped APIs reject ambiguous arguments', () => {
    assert.throws(() => new ESLintConfigBuilder().addBrowserGlobals(), {
        message: 'files must be a non-empty array of ESLint file patterns.',
        name: 'TypeError',
    });
    assert.throws(() => new ESLintConfigBuilder().addNodeGlobals({ files: 'src/**/*.js' }), {
        message: 'files must be a non-empty array of ESLint file patterns.',
        name: 'TypeError',
    });
    assert.throws(() => new ESLintConfigBuilder().addNodeGlobals({ files: [] }), {
        message: 'files must be a non-empty array of ESLint file patterns.',
        name: 'TypeError',
    });
    assert.throws(() => new ESLintConfigBuilder().addNativeBrowserModuleRules({ files: [''] }), {
        message: 'Each ESLint file pattern must be a non-empty string or a non-empty array of non-empty strings.',
        name: 'TypeError',
    });
    assert.throws(() => new ESLintConfigBuilder().addNativeBrowserModuleRules({ files: [[]] }), {
        message: 'Each ESLint file pattern must be a non-empty string or a non-empty array of non-empty strings.',
        name: 'TypeError',
    });
    assert.throws(() => new ESLintConfigBuilder().addNativeBrowserModuleRules({ files: [['src/**', '']] }), {
        message: 'Each ESLint file pattern must be a non-empty string or a non-empty array of non-empty strings.',
        name: 'TypeError',
    });
    assert.throws(() => new ESLintConfigBuilder().enableTypeScriptProject({ project: [] }), {
        message: 'project must be a non-empty path or a non-empty array of paths.',
        name: 'TypeError',
    });
    assert.throws(() => new ESLintConfigBuilder().enableTypeScriptProject({ project: '' }), {
        message: 'project must be a non-empty path or a non-empty array of paths.',
        name: 'TypeError',
    });
    assert.throws(() => new ESLintConfigBuilder().enableTypeScriptProject({ project: [''] }), {
        message: 'project must be a non-empty path or a non-empty array of paths.',
        name: 'TypeError',
    });
    assert.throws(() => new ESLintConfigBuilder().enableTypeScriptProject({ project: true }), {
        message: 'project must be a non-empty path or a non-empty array of paths.',
        name: 'TypeError',
    });

    const files = [['src/**', '**/*.js']];
    const projects = ['tsconfig.json'];
    const config = new ESLintConfigBuilder()
        .addNodeGlobals({ files })
        .enableTypeScriptProject({ files: ['**/*.ts'], project: projects })
        .toConfig();
    files[0].push('mutated');
    projects.push('mutated.json');

    const fileConfiguration = config.find((configuration) => configuration.languageOptions?.globals !== undefined);
    const projectConfiguration = config.find((configuration) => configuration.languageOptions?.parserOptions?.project !== undefined);

    assert.deepEqual(fileConfiguration.files, [['src/**', '**/*.js']]);
    assert.deepEqual(projectConfiguration.languageOptions.parserOptions.project, ['tsconfig.json']);
});

test('native browser module rules enforce runtime-resolvable imports', async () => {
    const builder = new ESLintConfigBuilder()
        .addBrowserGlobals({ files: ['src/**/*.js'] })
        .addJavaScriptRecommendedRules({ files: filePatterns.javascript })
        .addNativeBrowserModuleRules({ files: ['src/**/*.js'] });
    const valid = await lintText(
        builder,
        "import data from './data.json' with { type: 'json' };\nimport './module.js';\nexport * from '../shared/module.mjs';\nconsole.log(data);\nvoid import('./lazy.js');\nvoid import('./lazy.json', { with: { type: 'json' } });\n",
        'src/valid.js',
    );
    const invalid = await lintText(
        builder,
        "import 'package';\nimport './legacy.cjs';\nexport { value } from '@scope/package';\nexport * from 'https://example.com/module.js';\nvoid import('package');\nconst specifier = './module.js';\nvoid import(specifier);\nvoid import(1);\nvoid import(`./${specifier}.js`);\nvoid import('./legacy.cjs');\nvoid import('/absolute/module.js');\n",
        'src/invalid.js',
    );

    assert.equal(valid.errorCount, 0);
    assert.deepEqual(
        invalid.messages.map(({ ruleId }) => ruleId),
        [
            'no-restricted-imports',
            'no-restricted-imports',
            'no-restricted-imports',
            'no-restricted-imports',
            'no-restricted-syntax',
            'no-restricted-syntax',
            'no-restricted-syntax',
            'no-restricted-syntax',
            'no-restricted-syntax',
            'no-restricted-syntax',
        ],
    );
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
    const typescriptFiles = filePatterns.typescript;
    const javascriptFiles = filePatterns.javascript;

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

    assert.deepEqual(
        configFileResult.messages.map(({ ruleId }) => ruleId),
        ['eqeqeq'],
    );
    assert.equal(typescriptConfig.languageOptions.parserOptions.projectService, true);
});

test('TypeScript rule profiles remain independently selectable', async () => {
    const calculateConfig = async (builder) =>
        new ESLint({
            overrideConfig: builder.toConfig(),
            overrideConfigFile: true,
        }).calculateConfigForFile('src/index.ts');

    const recommended = await calculateConfig(new ESLintConfigBuilder().addTypeScriptRecommendedTypeCheckedRules());
    const strict = await calculateConfig(new ESLintConfigBuilder().addTypeScriptStrictTypeCheckedRules());
    const stylistic = await calculateConfig(new ESLintConfigBuilder().addTypeScriptStylisticTypeCheckedRules());
    const opinionated = await calculateConfig(new ESLintConfigBuilder().addTypeScriptOpinionatedTypeCheckedRules());

    assert.equal(recommended.rules['@typescript-eslint/no-floating-promises'][0], 2);
    assert.equal(recommended.rules['@typescript-eslint/no-unnecessary-condition'], undefined);
    assert.equal(strict.rules['@typescript-eslint/no-unnecessary-condition'][0], 2);
    assert.equal(strict.rules['@typescript-eslint/prefer-optional-chain'], undefined);
    assert.equal(stylistic.rules['@typescript-eslint/prefer-optional-chain'][0], 2);
    assert.equal(stylistic.rules['@typescript-eslint/no-floating-promises'], undefined);
    assert.equal(opinionated.rules['@typescript-eslint/no-unnecessary-condition'][0], 2);
    assert.equal(opinionated.rules['@typescript-eslint/prefer-optional-chain'][0], 2);
});

test('TypeScript, React Hooks, and Sonar configurations compose', async (context) => {
    const directory = await mkdtemp(join(tmpdir(), 'tooling-eslint-'));

    context.after(async () => {
        await rm(directory, {
            force: true,
            recursive: true,
        });
    });

    const tsconfig = join(directory, 'tsconfig.json');

    await writeFile(
        tsconfig,
        JSON.stringify({
            compilerOptions: {
                jsx: 'react-jsx',
                module: 'NodeNext',
                moduleResolution: 'NodeNext',
                strict: true,
                target: 'ES2025',
            },
            files: ['sample.ts', 'sample.tsx', 'types.d.ts'],
        }),
    );
    await writeFile(
        join(directory, 'sample.ts'),
        "import type { External } from 'external-types';\nexport type { External } from 'external-types';\nexport type * from 'external-types';\nexport type Answer = External;\nexport const answer = 42;\n",
    );
    await writeFile(join(directory, 'sample.tsx'), 'export const component = <main>answer</main>;\n');
    await writeFile(join(directory, 'types.d.ts'), "declare module 'external-types' {\n    export interface External {\n        readonly value: string;\n    }\n}\n");

    const typescriptFiles = [...filePatterns.typescript, ...filePatterns.tsx];

    const eslint = new ESLint({
        cwd: directory,
        overrideConfig: new ESLintConfigBuilder()
            .addBrowserGlobals({ files: typescriptFiles })
            .addJavaScriptRecommendedRules()
            .addTypeScriptStrictTypeCheckedRules({ files: typescriptFiles })
            .enableTypeScriptProject({
                files: typescriptFiles,
                project: tsconfig,
            })
            .addNativeBrowserModuleRules({ files: typescriptFiles })
            .addReactHooksRecommendedLatestRules()
            .addSonarJsRecommendedRules()
            .toConfig(),
        overrideConfigFile: true,
    });

    const typescriptConfig = await eslint.calculateConfigForFile(join(directory, 'sample.ts'));
    const [typescriptResult, tsxResult] = await eslint.lintFiles(['sample.ts', 'sample.tsx']);

    assert.equal(typescriptConfig.rules['@typescript-eslint/no-unnecessary-condition'][0], 2);
    assert.equal(typescriptConfig.rules['sonarjs/function-return-type'][0], 2);
    assert.equal(typescriptConfig.rules['react-hooks/rules-of-hooks'][0], 2);
    assert.equal(typescriptResult.errorCount, 0);
    assert.equal(tsxResult.fatalErrorCount, 0);
});
