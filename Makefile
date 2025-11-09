# 🧩 Makefile pour gérer les releases de la lib GoodFood UI

# Détecte la branche Git courante
BRANCH := $(shell git rev-parse --abbrev-ref HEAD)

# Vérifie qu'on est sur main, sinon stop
check-branch:
	@if [ "$(BRANCH)" != "main" ]; then \
		echo "❌ Tu n'es pas sur la branche 'main' (branche actuelle : $(BRANCH))"; \
		exit 1; \
	fi

# Version patch (ex: 0.1.0 → 0.1.1)
patch: check-branch
	@echo "🚀 Bump version patch..."
	npm version patch
	git push origin main --tags
	@echo "✅ Patch version publiée et tag poussée !"

# Version minor (ex: 0.1.0 → 0.2.0)
minor: check-branch
	@echo "🚀 Bump version minor..."
	npm version minor
	git push origin main --tags
	@echo "✅ Minor version publiée et tag poussée !"

# Version major (ex: 0.1.0 → 1.0.0)
major: check-branch
	@echo "🚀 Bump version major..."
	npm version major
	git push origin main --tags
	@echo "✅ Major version publiée et tag poussée !"
