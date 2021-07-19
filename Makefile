run: build
	docker run --rm -v ${PWD}/webapp:/webapp -p 3000:3000 -i -t translation-service

bash: build
	docker run --rm -v webapp:/webapp -i -t translation-service /bin/bash

build:
	docker build -t translation-service .

deploy-test: build
	docker run --rm -p 3000:3000 -i -t translation-service

.PHONY: bash run build deploy-test