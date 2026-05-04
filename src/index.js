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

export const selectors = {
  globalEcmaScript: ['**/*.tsx', '**/*.mts', '**/*.ts', '**/*.cts', '**/*.jsx', '**/*.mjs', '**/*.js', '**/*.cjs'],
  globalIgnore: ['**/.DS_Store', '**/.fleet', '**/.idea', '**/.vscode', '**/.zed'],
  globalJavaScript: ['**/*.js', '**/*.mjs', '**/*.cjs'],
  globalRc: ['**/*.config.js', '**/*.config.mjs', '**/.*rc.js', '**/.*rc.mjs', '**/*.config.cjs', '**/.*rc.cjs'],
  globalJsx: ['**/*.jsx'],
  globalTypeScript: ['**/*.ts', '**/*.mts', '**/*.cts'],
  globalTsx: ['**/*.tsx'],
  rootEcmaScript: ['*.tsx', '*.mts', '*.ts', '*.cts', '*.jsx', '*.mjs', '*.js', '*.cjs'],
  rootJavaScript: ['*.js', '*.mjs', '*.cjs'],
  rootRc: ['*.config.js', '*.config.mjs', '.*rc.js', '.*rc.mjs', '*.config.cjs', '.*rc.cjs'],
  rootJsx: ['*.jsx'],
  rootTypeScript: ['*.ts', '*.mts', '*.cts'],
  rootTsx: ['*.tsx'],
};

export class ESLint {
  config;

  constructor() {
    this.config = [];
  }

  get NODE_ENV() {
    return process.env.NODE_ENV;
  }

  addConfig(config) {
    this.config = [...this.config, config];

    return this;
  }

  configJsRecommended(options = {}) {
    return this.addConfig({
      extends: [eslint.configs.recommended],
      ...options,
    });
  }

  configJsOpinionatedRules(options = {}, rules = {}) {
    return this.addConfig({
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
      ...options,
    });
  }

  configTypeScriptStrictTypeChecked(options = {}) {
    return this.addConfig({
      extends: [typescript.configs.strictTypeChecked],
      ...options,
    });
  }

  configTypeScriptStylisticTypeChecked(options = {}) {
    return this.addConfig({
      extends: [typescript.configs.stylisticTypeChecked],
      ...options,
    });
  }

  configTypeScriptProjectService(options = {}) {
    return this.addConfig({
      extends: [
        {
          languageOptions: {
            parserOptions: {
              projectService: true,
            },
          },
        },
      ],
      ...options,
    });
  }

  configTypeScriptOpinionatedRules(options = {}, rules = {}) {
    return this.addConfig({
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
      ...options,
    });
  }

  configReactRecommended(options = {}) {
    return this.addConfig({
      extends: [react.configs.flat['recommended']],
      ...options,
    });
  }

  configReactJsxRuntime(options = {}) {
    return this.addConfig({
      extends: [react.configs.flat['jsx-runtime']],
      ...options,
    });
  }

  configReactSettings(options = {}) {
    return this.addConfig({
      extends: [
        {
          settings: {
            react: {
              version: 'detect',
            },
          },
        },
      ],
      ...options,
    });
  }

  configReactOpinionatedRules(options = {}, rules = {}) {
    return this.addConfig({
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
      ...options,
    });
  }

  configReactHooksRecommendedLatest(options = {}) {
    return this.addConfig({
      extends: [hooks.configs.flat['recommended-latest']],
      ...options,
    });
  }

  configJsxA11yStrict(options = {}) {
    return this.addConfig({
      extends: [a11y.flatConfigs.strict],
      ...options,
    });
  }

  configJsxA11yOpinionatedRules(options = {}, rules = {}) {
    return this.addConfig({
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
      ...options,
    });
  }

  configStylisticCustomized(options = {}, customizeOptions = {}) {
    return this.addConfig({
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
          ...customizeOptions,
        }),
      ],
      ...options,
    });
  }

  configStylisticOpinionatedRules(options = {}, rules = {}) {
    return this.addConfig({
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
      ...options,
    });
  }

  configStylisticDisableLegacy(options = {}) {
    return this.addConfig({
      extends: [stylistic.configs['disable-legacy']],
      ...options,
    });
  }

  configSonarJsRecommended(options = {}) {
    return this.addConfig({
      extends: [sonarjs.configs.recommended],
      ...options,
    });
  }

  configSonarJsOpinionatedOverrides(options = {}, rules = {}) {
    return this.addConfig({
      extends: [
        {
          rules: {
            'sonarjs/cognitive-complexity': 'off',
            'sonarjs/function-return-type': 'off',
            'sonarjs/no-nested-conditional': 'off',
            'sonarjs/void-use': 'off',
            ...rules,
          },
        },
      ],
      ...options,
    });
  }

  configGlobals(globals = {}, options = {}) {
    return this.addConfig({
      extends: [
        {
          languageOptions: {
            globals: globals,
          },
        },
      ],
      ...options,
    });
  }

  configIgnores(patterns = selectors.globalIgnore, name = undefined, options = {}) {
    return this.addConfig({
      extends: [globalIgnores(patterns, name)],
      ...options,
    });
  }

  configGlobalsRc(options = {}) {
    return this.configGlobals({
      ...globals.node,
      ...globals.es2024,
    }, {
      files: [...selectors.globalRc],
      ...options,
    });
  }

  configGlobalsBrowser(options = {}) {
    return this.configGlobals({
      ...globals.browser,
      ...globals.es2024,
    }, options);
  }

  configGlobalsNode(options = {}) {
    return this.configGlobals({
      ...globals.node,
      ...globals.es2024,
    }, options);
  }

  configTypeScriptDisabled(options = {}) {
    return this.addConfig({
      extends: [typescript.configs.disableTypeChecked],
      ...options,
    });
  }

  presetDefaults(options = {}) {
    const {
      configIgnores = true,
      configNodeModulesIgnores = true,
      configJsRecommended = true,
      configJsOpinionatedRules = true,
      configStylisticCustomized = true,
      configStylisticOpinionatedRules = true,
      configStylisticDisableLegacy = true,
      configSonarJsRecommended = true,
      configSonarJsOpinionatedOverrides = true,
    } = options;

    let eslint = this;

    if (configIgnores) {
      eslint = eslint.configIgnores();
    }

    if (configNodeModulesIgnores) {
      eslint = eslint.configIgnores(['node_modules']);
    }

    if (configJsRecommended) {
      eslint = eslint.configJsRecommended();
    }

    if (configJsOpinionatedRules) {
      eslint = eslint.configJsOpinionatedRules();
    }

    if (configStylisticCustomized) {
      eslint = eslint.configStylisticCustomized();
    }

    if (configStylisticOpinionatedRules) {
      eslint = eslint.configStylisticOpinionatedRules();
    }

    if (configStylisticDisableLegacy) {
      eslint = eslint.configStylisticDisableLegacy();
    }

    if (configSonarJsRecommended) {
      eslint = eslint.configSonarJsRecommended();
    }

    if (configSonarJsOpinionatedOverrides) {
      eslint = eslint.configSonarJsOpinionatedOverrides();
    }

    return eslint;
  }

  presetBrowser(options = {}) {
    const {
      configGlobalsRc = true,
      configGlobalsBrowser = true,
      presetDefaults = true,
      presetDefaultsOptions = {},
    } = options;

    let eslint = this;

    if (configGlobalsRc) {
      eslint = eslint.configGlobalsRc();
    }

    if (configGlobalsBrowser) {
      eslint = eslint.configGlobalsBrowser();
    }

    if (presetDefaults) {
      eslint = eslint.presetDefaults(presetDefaultsOptions);
    }

    return eslint;
  }

  presetNode(options = {}) {
    const {
      configGlobalsNode = true,
      presetDefaults = true,
      presetDefaultsOptions = {},
    } = options;

    let eslint = this;

    if (configGlobalsNode) {
      eslint = eslint.configGlobalsNode();
    }

    if (presetDefaults) {
      eslint = eslint.presetDefaults(presetDefaultsOptions);
    }

    return eslint;
  }

  presetTypeScript(options = {}) {
    const {
      files = [...selectors.globalTypeScript, ...selectors.globalTsx],
      disabledFiles = [...selectors.globalJavaScript, ...selectors.globalJsx],
      configTypeScriptStrictTypeChecked = true,
      configTypeScriptStylisticTypeChecked = true,
      configTypeScriptProjectService = true,
      configTypeScriptOpinionatedRules = true,
      configTypeScriptDisabled = true,
    } = options;

    const enabledOptions = files === false ? {} : { files: [...files] };
    const disabledOptions = disabledFiles === false ? {} : { files: [...disabledFiles] };
    let eslint = this;

    if (configTypeScriptStrictTypeChecked) {
      eslint = eslint.configTypeScriptStrictTypeChecked(enabledOptions);
    }

    if (configTypeScriptStylisticTypeChecked) {
      eslint = eslint.configTypeScriptStylisticTypeChecked(enabledOptions);
    }

    if (configTypeScriptProjectService) {
      eslint = eslint.configTypeScriptProjectService(enabledOptions);
    }

    if (configTypeScriptOpinionatedRules) {
      eslint = eslint.configTypeScriptOpinionatedRules(enabledOptions);
    }

    if (configTypeScriptDisabled) {
      eslint = eslint.configTypeScriptDisabled(disabledOptions);
    }

    return eslint;
  }

  presetReact(options = {}) {
    const {
      configReactRecommended = true,
      configReactJsxRuntime = true,
      configReactSettings = true,
      configReactOpinionatedRules = true,
      configJsxA11yStrict = true,
      configJsxA11yOpinionatedRules = true,
      configReactHooksRecommendedLatest = true,
    } = options;

    let eslint = this;

    if (configReactRecommended) {
      eslint = eslint.configReactRecommended();
    }

    if (configReactJsxRuntime) {
      eslint = eslint.configReactJsxRuntime();
    }

    if (configReactSettings) {
      eslint = eslint.configReactSettings();
    }

    if (configReactOpinionatedRules) {
      eslint = eslint.configReactOpinionatedRules();
    }

    if (configJsxA11yStrict) {
      eslint = eslint.configJsxA11yStrict();
    }

    if (configJsxA11yOpinionatedRules) {
      eslint = eslint.configJsxA11yOpinionatedRules();
    }

    if (configReactHooksRecommendedLatest) {
      eslint = eslint.configReactHooksRecommendedLatest();
    }

    return eslint;
  }

  buildConfig() {
    return defineConfig([...this.config]);
  }
}
