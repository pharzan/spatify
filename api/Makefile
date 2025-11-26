.PHONY: dev build db-migrate db-generate db-studio db-up db-down db-reset lint lint-fix format format-check

run:
	npm run dev

build:
	npm run build

db-migrate:
	npm run db:migrate

db-generate:
	npm run db:generate

db-studio:
	npm run db:studio

db-up:
	./scripts/dev-db.sh up

db-down:
	./scripts/dev-db.sh down
	
db-reset:
	npm run seed:data

lint:
	npm run lint

lint-fix:
	npm run lint:fix

format:
	npm run format

format-check:
	npm run format:check
