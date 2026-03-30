# Default shell
SHELL := /bin/bash

# Default goal
.DEFAULT_GOAL := never

# Options
export DEBIAN_FRONTEND := noninteractive
export PHP_CS_FIXER_FUTURE_MODE=1

# Goals
.PHONY: commit
commit: distclean update fix check

.PHONY: fix
fix: fix_eslint fix_prettier

.PHONY: check
check: lint audit

.PHONY: lint
lint: lint_eslint lint_prettier

.PHONY: audit
audit: audit_npm

.PHONY: install
install: install_npm

.PHONY: update
update: update_npm

.PHONY: clean
clean:
	rm -rf ./node_modules

.PHONY: distclean
distclean: clean
	git clean -Xfd

.PHONY: fix_eslint
fix_eslint: ./node_modules ./eslint.config.js
	npm exec --ignore-scripts --no-progress --no-color --loglevel=warn -- eslint --quiet --concurrency=auto --no-color --fix .

.PHONY: fix_prettier
fix_prettier: ./node_modules ./prettier.config.js
	npm exec --ignore-scripts --no-progress --no-color --loglevel=warn -- prettier --log-level=warn --no-color -w .

.PHONY: lint_eslint
lint_eslint: ./node_modules ./eslint.config.js
	npm exec --ignore-scripts --no-progress --no-color --loglevel=warn -- eslint --quiet --concurrency=auto --no-color .

.PHONY: lint_prettier
lint_prettier: ./node_modules ./prettier.config.js
	npm exec --ignore-scripts --no-progress --no-color --loglevel=warn -- prettier --log-level=warn --no-color -c .

.PHONY: audit_npm
audit_npm: ./node_modules ./package.json ./package-lock.json
	npm audit --ignore-scripts --no-progress --no-color --loglevel=warn --audit-level=critical --install-links --include=prod --include=dev --include=peer --include=optional

.PHONY: install_npm
install_npm: ./package.json ./package-lock.json
	npm install --ignore-scripts --no-progress --no-color --loglevel=warn --install-links --include=prod --include=dev --include=peer --include=optional

.PHONY: update_npm
update_npm: ./package.json
	rm -rf ./node_modules
	rm -rf ./package-lock.json
	npm update --ignore-scripts --no-progress --no-color --loglevel=warn --install-links --include=prod --include=dev --include=peer --include=optional

.PHONY: postcreate
postcreate: install

.PHONY: password
password:
	@tr -dc 'a-zA-Z0-9' < /dev/urandom | head -c 32

.PHONY: secret
secret:
	@tr -dc 'a-zA-Z0-9' < /dev/urandom | head -c 64

.PHONY: devcontainer
devcontainer:
	devcontainer up
	devcontainer exec /bin/bash
	docker compose -f ./docker-compose.yml -f ./docker-compose-devcontainer.yml down --remove-orphans

.PHONY: inspect
inspect:
	npm exec --ignore-scripts --no-progress --no-color --loglevel=warn -- eslint --inspect-config

# Dependencies
./package-lock.json ./node_modules: ./package.json
	${MAKE} update_npm
