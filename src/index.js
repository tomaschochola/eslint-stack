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

export const filePatterns = Object.freeze({
    allScriptFiles: Object.freeze(['**/*.cjs', '**/*.cts', '**/*.js', '**/*.jsx', '**/*.mjs', '**/*.mts', '**/*.ts', '**/*.tsx']),
    allJavaScriptFiles: Object.freeze(['**/*.cjs', '**/*.js', '**/*.mjs']),
    allJsxFiles: Object.freeze(['**/*.jsx']),
    allTypeScriptDeclarationFiles: Object.freeze(['**/*.d.cts', '**/*.d.mts', '**/*.d.ts', '**/*.d.*.ts']),
    allTypeScriptFiles: Object.freeze(['**/*.cts', '**/*.mts', '**/*.ts']),
    allTsxFiles: Object.freeze(['**/*.tsx']),
    allConfigScriptFiles: Object.freeze([
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
    ]),
    playwrightTypeScriptFiles: Object.freeze(['tests/**/*.ts', 'playwright.config.ts']),
    rootScriptFiles: Object.freeze(['*.cjs', '*.cts', '*.js', '*.jsx', '*.mjs', '*.mts', '*.ts', '*.tsx']),
    rootJavaScriptFiles: Object.freeze(['*.cjs', '*.js', '*.mjs']),
    rootJsxFiles: Object.freeze(['*.jsx']),
    rootTypeScriptFiles: Object.freeze(['*.cts', '*.mts', '*.ts']),
    rootTsxFiles: Object.freeze(['*.tsx']),
    rootConfigScriptFiles: Object.freeze([
        '*.config.cts',
        '*.config.cjs',
        '*.config.js',
        '*.config.mjs',
        '*.config.mts',
        '*.config.ts',
        '.*rc.cts',
        '.*rc.cjs',
        '.*rc.js',
        '.*rc.mjs',
        '.*rc.mts',
        '.*rc.ts',
    ]),
});

const filesConfig = (files) => (files === undefined ? {} : { files: [...files] });

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
            ...filesConfig(files),
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
                            project,
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
                files: filePatterns.allConfigScriptFiles,
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
