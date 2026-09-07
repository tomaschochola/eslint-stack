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

import eslint from '@eslint/js';
import hooks from 'eslint-plugin-react-hooks';
import sonarjs from 'eslint-plugin-sonarjs';
import { defineConfig, globalIgnores, includeIgnoreFile } from 'eslint/config';
import globals from 'globals';
import { fileURLToPath } from 'node:url';
import typescript from 'typescript-eslint';

const configurations = Object.freeze([
    '**/*.config.cts',
    '**/*.config.cjs',
    '**/*.config.js',
    '**/*.config.mjs',
    '**/*.config.mts',
    '**/*.config.ts',
    '**/.*rc.cts',
    '**/.*rc.cjs',
    '**/.*rc.js',
    '**/.*rc.mjs',
    '**/.*rc.mts',
    '**/.*rc.ts',
]);
const declarations = Object.freeze(['**/*.d.cts', '**/*.d.mts', '**/*.d.ts', '**/*.d.*.ts']);
const javascript = Object.freeze(['**/*.cjs', '**/*.js', '**/*.mjs']);
const jsx = Object.freeze(['**/*.jsx']);
const playwright = Object.freeze(['**/playwright.config.cts', '**/playwright.config.mts', '**/playwright.config.ts', 'tests/**/*.cts', 'tests/**/*.mts', 'tests/**/*.ts', 'tests/**/*.tsx']);
const tsx = Object.freeze(['**/*.tsx']);
const typescriptPatterns = Object.freeze(['**/*.cts', '**/*.mts', '**/*.ts']);

export const filePatterns = Object.freeze({
    configurations,
    declarations,
    javascript,
    jsx,
    playwright,
    scripts: Object.freeze([...javascript, ...jsx, ...typescriptPatterns, ...tsx]),
    tsx,
    typescript: typescriptPatterns,
});

function normalizeFilePatterns(files, { required = false } = {}) {
    if (files === undefined && !required) {
        return undefined;
    }

    if (!Array.isArray(files) || files.length === 0) {
        throw new TypeError('files must be a non-empty array of ESLint file patterns.');
    }

    return files.map((pattern) => {
        if (typeof pattern === 'string' && pattern.length > 0) {
            return pattern;
        }

        if (Array.isArray(pattern) && pattern.length > 0 && pattern.every((part) => typeof part === 'string' && part.length > 0)) {
            return [...pattern];
        }

        throw new TypeError('Each ESLint file pattern must be a non-empty string or a non-empty array of non-empty strings.');
    });
}

function normalizeProject(project) {
    if (typeof project === 'string' && project.length > 0) {
        return project;
    }

    if (Array.isArray(project) && project.length > 0 && project.every((path) => typeof path === 'string' && path.length > 0)) {
        return [...project];
    }

    throw new TypeError('project must be a non-empty path or a non-empty array of paths.');
}

const filesConfig = (files, options = {}) => {
    const normalized = normalizeFilePatterns(files, options);

    return normalized === undefined ? {} : { files: normalized };
};

export class ESLintConfigBuilder {
    #config;

    constructor() {
        this.#config = [];
    }

    #addConfig(config) {
        this.#config = [...this.#config, config];

        return this;
    }

    #addGlobals(globalVariables = {}, { files } = {}) {
        return this.#addConfig({
            ...filesConfig(files, { required: true }),
            extends: [
                {
                    languageOptions: {
                        globals: globalVariables,
                    },
                },
            ],
        });
    }

    addRawConfig(config) {
        return this.#addConfig(config);
    }

    addJavaScriptRecommendedRules({ files } = {}) {
        return this.#addConfig({
            ...filesConfig(files),
            extends: [eslint.configs.recommended],
        });
    }

    addTypeScriptRecommendedTypeCheckedRules({ files } = {}) {
        return this.#addConfig({
            ...filesConfig(files),
            extends: [typescript.configs.recommendedTypeChecked],
        });
    }

    addTypeScriptStrictTypeCheckedRules({ files } = {}) {
        return this.#addConfig({
            ...filesConfig(files),
            extends: [typescript.configs.strictTypeChecked],
        });
    }

    addTypeScriptStylisticTypeCheckedRules({ files } = {}) {
        return this.#addConfig({
            ...filesConfig(files),
            extends: [typescript.configs.stylisticTypeChecked],
        });
    }

    addTypeScriptOpinionatedTypeCheckedRules({ files } = {}) {
        return this.addTypeScriptStrictTypeCheckedRules({ files }).addTypeScriptStylisticTypeCheckedRules({ files });
    }

    enableTypeScriptProjectService({ files } = {}) {
        return this.#addConfig({
            ...filesConfig(files),
            extends: [
                {
                    languageOptions: {
                        parserOptions: {
                            projectService: true,
                        },
                    },
                },
            ],
        });
    }

    enableTypeScriptProject({ files, project }) {
        return this.#addConfig({
            ...filesConfig(files),
            extends: [
                {
                    languageOptions: {
                        parserOptions: {
                            project: normalizeProject(project),
                            projectService: false,
                        },
                    },
                },
            ],
        });
    }

    addReactHooksRecommendedLatestRules({ files } = {}) {
        return this.#addConfig({
            ...filesConfig(files),
            extends: [hooks.configs.flat['recommended-latest']],
        });
    }

    addSonarJsRecommendedRules({ files } = {}) {
        return this.#addConfig({
            ...filesConfig(files),
            extends: [sonarjs.configs.recommended],
        });
    }

    addNativeBrowserModuleRules({ files } = {}) {
        return this.#addConfig({
            ...filesConfig(files, { required: true }),
            rules: {
                'no-restricted-imports': [
                    'error',
                    {
                        patterns: [
                            {
                                allowTypeImports: true,
                                message: 'Native browser runtime imports must use relative JavaScript or JSON URLs.',
                                regex: '^(?!\\.{1,2}/)|\\.(?:cjs|cts|jsx|ts|tsx)(?:[?#]|$)',
                            },
                        ],
                    },
                ],
                'no-restricted-syntax': [
                    'error',
                    {
                        message: 'Native browser dynamic imports must use a string literal.',
                        selector: 'ImportExpression:not([source.value=/^.*$/])',
                    },
                    {
                        message: 'Native browser dynamic imports must use relative JavaScript or JSON URLs.',
                        selector: 'ImportExpression[source.value=/^(?![.][.]?\\u002f)|[.](?:cjs|cts|jsx|ts|tsx)(?:[?#]|$)/]',
                    },
                ],
            },
        });
    }

    addGitIgnoreFile(configUrl) {
        return this.#addConfig(
            includeIgnoreFile(fileURLToPath(new URL('.gitignore', configUrl)), {
                gitignoreResolution: true,
            }),
        );
    }

    addGlobalIgnores(patterns, name = undefined) {
        return this.#addConfig({
            extends: [globalIgnores(patterns, name)],
        });
    }

    addNodeGlobalsForConfigFiles() {
        return this.#addGlobals(
            {
                ...globals.node,
                ...globals.es2025,
            },
            {
                files: filePatterns.configurations,
            },
        );
    }

    addBrowserGlobals({ files } = {}) {
        return this.#addGlobals(
            {
                ...globals.browser,
                ...globals.es2025,
            },
            { files },
        );
    }

    addNodeGlobals({ files } = {}) {
        return this.#addGlobals(
            {
                ...globals.node,
                ...globals.es2025,
            },
            { files },
        );
    }

    disableTypeScriptTypeChecking({ files } = {}) {
        return this.#addConfig({
            ...filesConfig(files),
            extends: [typescript.configs.disableTypeChecked],
        });
    }

    toConfig() {
        return defineConfig([...this.#config]);
    }
}
