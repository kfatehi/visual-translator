run: build
	npm i
	mkdir -p tmp
	docker run --gpus all --rm -v ${PWD}/tesseract_models:/tess -v ${PWD}/argos_models:/argos -v ${PWD}:/home/user/app -p 3001:3000 -i -t translation-service

bash: build
	docker run --gpus all --rm -v ${PWD}/tesseract_models:/tess -v ${PWD}/argos_models:/argos -v ${PWD}:/home/user/app -i -t translation-service /bin/bash

argos: build
	mkdir -p argos_models
	docker run --rm -v ${PWD}/argos_models:/argos -i -t translation-service bash -c "argospm update && argospm install translate-fa_en && argospm install translate-en_fa"

tess: 
	mkdir -p tesseract_models
	curl -sSLo tesseract_models/fas.traineddata https://github.com/tesseract-ocr/tessdata_best/raw/main/fas.traineddata

build:
	docker build -t translation-service .

deploy-test: build
	docker run --rm -p 3000:3000 -i -t translation-service

.PHONY: bash run build deploy-test

#  argos-translate --from-lang en --to-lang fa "hello"
