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

import { EslintStack, selectors } from '@tomaschochola/eslint-stack';
import globals from 'globals';

// eslint-disable-next-line no-restricted-exports
export default new EslintStack()
  .globals({
    ...globals.node,
    ...globals.es2024,
  }, { files: [...selectors.globalRc] })
  .globals({
    ...globals.browser,
    ...globals.es2024,
  })
  .ignores()
  .ignores(['node_modules'])
  .recommended()
  .typescript({ files: [...selectors.globalTypeScript, ...selectors.globalTsx] })
  .stylistic()
  .react()
  .jsxA11y()
  .reactHooks()
  .sonarjs()
  .typescriptDisabled({ files: [...selectors.globalJavaScript, ...selectors.globalJsx] })
  .build();
