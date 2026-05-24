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
import stylistic from '@stylistic/eslint-plugin';
import a11y from 'eslint-plugin-jsx-a11y';
import react from 'eslint-plugin-react';
import hooks from 'eslint-plugin-react-hooks';
import sonarjs from 'eslint-plugin-sonarjs';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import typescript from 'typescript-eslint';

export const filePatterns = Object.freeze({
  allScriptFiles: Object.freeze(['**/*.tsx', '**/*.mts', '**/*.ts', '**/*.cts', '**/*.jsx', '**/*.mjs', '**/*.js', '**/*.cjs']),
  allJavaScriptFiles: Object.freeze(['**/*.js', '**/*.mjs', '**/*.cjs']),
  allJsxFiles: Object.freeze(['**/*.jsx']),
  allTypeScriptFiles: Object.freeze(['**/*.ts', '**/*.mts', '**/*.cts']),
  allTsxFiles: Object.freeze(['**/*.tsx']),
  allConfigScriptFiles: Object.freeze(['**/*.config.js', '**/*.config.mjs', '**/.*rc.js', '**/.*rc.mjs', '**/*.config.cjs', '**/.*rc.cjs']),
  rootScriptFiles: Object.freeze(['*.tsx', '*.mts', '*.ts', '*.cts', '*.jsx', '*.mjs', '*.js', '*.cjs']),
  rootJavaScriptFiles: Object.freeze(['*.js', '*.mjs', '*.cjs']),
  rootJsxFiles: Object.freeze(['*.jsx']),
  rootTypeScriptFiles: Object.freeze(['*.ts', '*.mts', '*.cts']),
  rootTsxFiles: Object.freeze(['*.tsx']),
  rootConfigScriptFiles: Object.freeze(['*.config.js', '*.config.mjs', '.*rc.js', '.*rc.mjs', '*.config.cjs', '.*rc.cjs']),
  defaultIgnorePatterns: Object.freeze(['**/.DS_Store', '**/.fleet', '**/.idea', '**/.vscode', '**/.zed']),
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

  #addGlobals(globals = {}, { files } = {}) {
    return this.#addConfig({
      ...filesConfig(files),
      extends: [
        {
          languageOptions: {
            globals: globals,
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

  addJavaScriptPolicyRules({ files, rules = {} } = {}) {
    return this.#addConfig({
      ...filesConfig(files),
      extends: [
        {
          rules: {
            'no-restricted-exports': [
              'error',
              {
                restrictDefaultExports: {
                  direct: true,
                  named: true,
                  defaultFrom: true,
                  namedFrom: true,
                  namespaceFrom: true,
                },
              },
            ],
            ...rules,
          },
        },
      ],
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
              project: project,
              projectService: false,
            },
          },
        },
      ],
    });
  }

  addTypeScriptPolicyRules({ files, rules = {} } = {}) {
    return this.#addConfig({
      ...filesConfig(files),
      extends: [
        {
          rules: {
            '@typescript-eslint/consistent-type-exports': 'error',
            '@typescript-eslint/consistent-type-imports': 'error',
            '@typescript-eslint/default-param-last': 'error',
            '@typescript-eslint/explicit-member-accessibility': 'error',
            '@typescript-eslint/method-signature-style': 'error',
            '@typescript-eslint/no-import-type-side-effects': 'error',
            '@typescript-eslint/no-loop-func': 'error',
            '@typescript-eslint/no-shadow': 'error',
            '@typescript-eslint/no-unnecessary-parameter-property-assignment': 'error',
            '@typescript-eslint/no-unnecessary-qualifier': 'error',
            '@typescript-eslint/no-unsafe-type-assertion': 'error',
            '@typescript-eslint/no-use-before-define': 'error',
            '@typescript-eslint/no-useless-empty-export': 'error',
            '@typescript-eslint/parameter-properties': 'error',
            '@typescript-eslint/prefer-enum-initializers': 'error',
            '@typescript-eslint/prefer-readonly': 'error',
            '@typescript-eslint/require-array-sort-compare': 'error',
            '@typescript-eslint/strict-boolean-expressions': [
              'error',
              {
                allowAny: false,
                allowNullableBoolean: false,
                allowNullableEnum: false,
                allowNullableNumber: false,
                allowNullableObject: false,
                allowNullableString: false,
                allowNumber: false,
                allowRuleToRunWithoutStrictNullChecksIKnowWhatIAmDoing: false,
                allowString: false,
              },
            ],
            '@typescript-eslint/switch-exhaustiveness-check': 'error',
            'default-param-last': 'off',
            'no-loop-func': 'off',
            'no-shadow': 'off',
            'no-use-before-define': 'off',
            ...rules,
          },
        },
      ],
    });
  }

  addReactRecommendedRules({ files } = {}) {
    return this.#addConfig({
      ...filesConfig(files),
      extends: [react.configs.flat['recommended']],
    });
  }

  addReactJsxRuntimeRules({ files } = {}) {
    return this.#addConfig({
      ...filesConfig(files),
      extends: [react.configs.flat['jsx-runtime']],
    });
  }

  addReactVersionDetection({ files } = {}) {
    return this.#addConfig({
      ...filesConfig(files),
      extends: [
        {
          settings: {
            react: {
              version: 'detect',
            },
          },
        },
      ],
    });
  }

  addReactPolicyRules({ files, rules = {} } = {}) {
    return this.#addConfig({
      ...filesConfig(files),
      extends: [
        {
          rules: {
            'react/boolean-prop-naming': 'error',
            'react/checked-requires-onchange-or-readonly': 'error',
            'react/default-props-match-prop-types': 'error',
            'react/destructuring-assignment': 'error',
            'react/forbid-foreign-prop-types': 'error',
            'react/forbid-prop-types': 'error',
            'react/forward-ref-uses-ref': 'error',
            'react/function-component-definition': 'error',
            'react/hook-use-state': 'error',
            'react/iframe-missing-sandbox': 'error',
            'react/jsx-boolean-value': 'error',
            'react/jsx-filename-extension': ['error', { extensions: ['.jsx', '.tsx'] }],
            'react/jsx-fragments': 'error',
            'react/jsx-handler-names': 'error',
            'react/jsx-no-bind': 'error',
            'react/jsx-no-constructed-context-values': 'error',
            'react/jsx-no-leaked-render': 'error',
            'react/jsx-no-literals': 'error',
            'react/jsx-no-script-url': 'error',
            'react/jsx-no-useless-fragment': 'error',
            'react/jsx-pascal-case': 'error',
            'react/jsx-props-no-spread-multi': 'error',
            'react/no-access-state-in-setstate': 'error',
            'react/no-adjacent-inline-elements': 'error',
            'react/no-array-index-key': 'error',
            'react/no-arrow-function-lifecycle': 'error',
            'react/no-danger': 'error',
            'react/no-did-mount-set-state': 'error',
            'react/no-did-update-set-state': 'error',
            'react/no-invalid-html-attribute': 'error',
            'react/no-namespace': 'error',
            'react/no-object-type-as-default-prop': 'error',
            'react/no-redundant-should-component-update': 'error',
            'react/no-this-in-sfc': 'error',
            'react/no-typos': 'error',
            'react/no-unsafe': 'error',
            'react/no-unstable-nested-components': 'error',
            'react/no-unused-class-component-methods': 'error',
            'react/no-unused-prop-types': 'error',
            'react/no-unused-state': 'error',
            'react/no-will-update-set-state': 'error',
            'react/prefer-es6-class': 'error',
            'react/prefer-exact-props': 'error',
            'react/prefer-read-only-props': 'error',
            'react/prefer-stateless-function': 'error',
            'react/require-optimization': 'error',
            'react/state-in-constructor': 'error',
            'react/static-property-placement': 'error',
            'react/style-prop-object': 'error',
            'react/void-dom-elements-no-children': 'error',
            ...rules,
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

  addJsxAccessibilityStrictRules({ files } = {}) {
    return this.#addConfig({
      ...filesConfig(files),
      extends: [a11y.flatConfigs.strict],
    });
  }

  addJsxAccessibilityPolicyRules({ files, rules = {} } = {}) {
    return this.#addConfig({
      ...filesConfig(files),
      extends: [
        {
          rules: {
            'jsx-a11y/anchor-ambiguous-text': 'error',
            'jsx-a11y/control-has-associated-label': 'error',
            'jsx-a11y/lang': 'error',
            'jsx-a11y/no-aria-hidden-on-focusable': 'error',
            'jsx-a11y/prefer-tag-over-role': 'error',
            ...rules,
          },
        },
      ],
    });
  }

  addStylisticCustomizedRules({ files, customize = {} } = {}) {
    return this.#addConfig({
      ...filesConfig(files),
      extends: [
        stylistic.configs.customize({
          arrowParens: true,
          blockSpacing: true,
          braceStyle: '1tbs',
          commaDangle: 'always-multiline',
          indent: 2,
          jsx: true,
          quoteProps: 'consistent-as-needed',
          quotes: 'single',
          semi: true,
          ...customize,
        }),
      ],
    });
  }

  addStylisticPolicyRules({ files, rules = {} } = {}) {
    return this.#addConfig({
      ...filesConfig(files),
      extends: [
        {
          rules: {
            '@stylistic/array-bracket-newline': 'error',
            '@stylistic/array-element-newline': [
              'error',
              {
                consistent: true,
                multiline: true,
              },
            ],
            '@stylistic/curly-newline': ['error', 'always'],
            '@stylistic/function-call-argument-newline': ['error', 'consistent'],
            '@stylistic/function-call-spacing': 'error',
            '@stylistic/function-paren-newline': ['error', 'consistent'],
            '@stylistic/implicit-arrow-linebreak': 'error',
            '@stylistic/line-comment-position': 'error',
            '@stylistic/linebreak-style': 'error',
            '@stylistic/lines-around-comment': [
              'error',
              {
                beforeBlockComment: true,
                beforeLineComment: true,
                afterHashbangComment: true,
                allowBlockStart: true,
                allowObjectStart: true,
                allowArrayStart: true,
                allowClassStart: true,
                allowEnumStart: true,
                allowInterfaceStart: true,
                allowModuleStart: true,
                allowTypeStart: true,
              },
            ],
            '@stylistic/multiline-comment-style': 'error',
            '@stylistic/no-confusing-arrow': 'error',
            '@stylistic/no-extra-semi': 'error',
            '@stylistic/nonblock-statement-body-position': 'error',
            '@stylistic/object-curly-newline': [
              'error',
              {
                consistent: true,
                multiline: true,
              },
            ],
            '@stylistic/object-property-newline': 'error',
            '@stylistic/one-var-declaration-per-line': ['error', 'always'],
            '@stylistic/padding-line-between-statements': [
              'error',
              {
                blankLine: 'always',
                prev: '*',
                next: 'return',
              },
              {
                blankLine: 'always',
                prev: '*',
                next: 'break',
              },
              {
                blankLine: 'always',
                prev: '*',
                next: 'case',
              },
              {
                blankLine: 'always',
                prev: '*',
                next: 'class',
              },
              {
                blankLine: 'always',
                prev: '*',
                next: 'continue',
              },
              {
                blankLine: 'always',
                prev: '*',
                next: 'debugger',
              },
              {
                blankLine: 'always',
                prev: '*',
                next: 'default',
              },
              {
                blankLine: 'always',
                prev: '*',
                next: 'do',
              },
              {
                blankLine: 'always',
                prev: '*',
                next: 'export',
              },
              {
                blankLine: 'always',
                prev: '*',
                next: 'for',
              },
              {
                blankLine: 'always',
                prev: '*',
                next: 'function',
              },
              {
                blankLine: 'always',
                prev: '*',
                next: 'if',
              },
              {
                blankLine: 'always',
                prev: '*',
                next: 'switch',
              },
              {
                blankLine: 'always',
                prev: '*',
                next: 'throw',
              },
              {
                blankLine: 'always',
                prev: '*',
                next: 'try',
              },
              {
                blankLine: 'always',
                prev: '*',
                next: 'while',
              },
              {
                blankLine: 'always',
                prev: '*',
                next: 'with',
              },
              {
                blankLine: 'always',
                prev: ['const', 'let', 'var'],
                next: '*',
              },
              {
                blankLine: 'always',
                prev: ['singleline-const', 'singleline-let', 'singleline-var'],
                next: '*',
              },
              {
                blankLine: 'always',
                prev: ['multiline-const', 'multiline-let', 'multiline-var'],
                next: '*',
              },
              {
                blankLine: 'always',
                prev: 'import',
                next: '*',
              },
              {
                blankLine: 'always',
                prev: 'cjs-import',
                next: '*',
              },
              {
                blankLine: 'always',
                prev: 'export',
                next: '*',
              },
              {
                blankLine: 'any',
                prev: 'singleline-const',
                next: 'singleline-const',
              },
              {
                blankLine: 'any',
                prev: 'singleline-let',
                next: 'singleline-let',
              },
              {
                blankLine: 'any',
                prev: 'singleline-var',
                next: 'singleline-var',
              },
              {
                blankLine: 'any',
                prev: 'import',
                next: 'import',
              },
              {
                blankLine: 'any',
                prev: 'cjs-import',
                next: 'cjs-import',
              },
              {
                blankLine: 'any',
                prev: 'export',
                next: 'export',
              },
              {
                blankLine: 'always',
                prev: '*',
                next: 'multiline-const',
              },
              {
                blankLine: 'always',
                prev: '*',
                next: 'multiline-let',
              },
              {
                blankLine: 'always',
                prev: '*',
                next: 'multiline-var',
              },
              {
                blankLine: 'always',
                prev: '*',
                next: 'multiline-export',
              },
              {
                blankLine: 'always',
                prev: '*',
                next: 'block-like',
              },
              {
                blankLine: 'always',
                prev: 'block-like',
                next: '*',
              },
            ],
            '@stylistic/semi-style': 'error',
            '@stylistic/switch-colon-spacing': 'error',
            '@stylistic/wrap-regex': 'error',
            '@stylistic/jsx-child-element-spacing': 'error',
            '@stylistic/jsx-pascal-case': 'error',
            '@stylistic/jsx-props-no-multi-spaces': 'error',
            '@stylistic/jsx-self-closing-comp': 'error',
            '@stylistic/jsx-max-props-per-line': [
              'error',
              {
                maximum: 1,
                when: 'always',
              },
            ],
            '@stylistic/jsx-one-expression-per-line': ['error', { allow: 'none' }],
            '@stylistic/jsx-first-prop-new-line': ['error', 'always'],
            ...rules,
          },
        },
      ],
    });
  }

  disableStylisticLegacyRules({ files } = {}) {
    return this.#addConfig({
      ...filesConfig(files),
      extends: [stylistic.configs['disable-legacy']],
    });
  }

  addSonarJsRecommendedRules({ files } = {}) {
    return this.#addConfig({
      ...filesConfig(files),
      extends: [sonarjs.configs.recommended],
    });
  }

  addSonarJsPolicyOverrides({ files, rules = {} } = {}) {
    return this.#addConfig({
      ...filesConfig(files),
      extends: [
        {
          rules: {
            'sonarjs/function-return-type': 'off',
            'sonarjs/no-nested-conditional': 'off',
            'sonarjs/void-use': 'off',
            ...rules,
          },
        },
      ],
    });
  }

  addGlobalIgnores(patterns = filePatterns.defaultIgnorePatterns, name = undefined) {
    return this.#addConfig({
      extends: [globalIgnores(patterns, name)],
    });
  }

  addNodeGlobalsForConfigFiles() {
    return this.#addGlobals({
      ...globals.node,
      ...globals.es2024,
    }, {
      files: filePatterns.allConfigScriptFiles,
    });
  }

  addBrowserGlobals({ files } = {}) {
    return this.#addGlobals({
      ...globals.browser,
      ...globals.es2024,
    }, { files });
  }

  addNodeGlobals({ files } = {}) {
    return this.#addGlobals({
      ...globals.node,
      ...globals.es2024,
    }, { files });
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
