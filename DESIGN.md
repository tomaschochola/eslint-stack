# Design

This package exposes explicit ESLint configuration fragments.

There are no repository-owned broad presets.
Project configs and templates must list every layer directly.

Layer order:

1. Runtime globals.
2. Ignored files.
3. JavaScript recommended rules.
4. JavaScript policy rules.
5. TypeScript rules, when applicable.
6. React rules, when applicable.
7. JSX accessibility rules, when applicable.
8. Stylistic configured rules.
9. Stylistic policy rules.
10. Stylistic legacy disabling.
11. SonarJS recommended rules.
12. SonarJS policy overrides.
13. Raw project-local config, last only.

Methods with `Policy` in their name encode Tomas Chochola repository policy.
Methods with `Recommended` or `Configured` in their name wrap upstream/vendor configuration.
