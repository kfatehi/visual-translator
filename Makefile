build: 
	npm i
	mkdir -p tmp tesseract_models argos_models
	docker build -t translation-service .
	make tess
	make argos

run:
	docker run --gpus all --rm -v ${PWD}/tesseract_models:/tess -v ${PWD}/argos_models:/argos -v ${PWD}:/home/user/app -p 3002:3000 -i -t translation-service

deploy:
	docker run -d --restart=unless-stopped --name fa-visual-translator --gpus all -v ${PWD}/tesseract_models:/tess -v ${PWD}/argos_models:/argos -v ${PWD}:/home/user/app -p 3001:3000 translation-service

bash:
	docker run --gpus all --rm -v ${PWD}/tesseract_models:/tess -v ${PWD}/argos_models:/argos -v ${PWD}:/home/user/app -i -t translation-service /bin/bash

argos:
	docker run --rm -v ${PWD}/argos_models:/argos -i -t translation-service bash -c "argospm update && argospm install translate-fa_en && argospm install translate-en_fa"

tess: 
	curl -sSLo tesseract_models/fas.traineddata https://github.com/tesseract-ocr/tessdata_best/raw/main/fas.traineddata

.PHONY: build run deploy bash argos tess

#  argos-translate --from-lang en --to-lang fa "hello"
