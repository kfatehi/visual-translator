FROM ubuntu:20.04
ENV DEBIANFRONTEND=noninteractive
RUN apt update
RUN apt upgrade -y

RUN apt install -y curl

RUN apt install -y tesseract-ocr
RUN curl -sSLo /usr/share/tesseract-ocr/4.00/tessdata/fas.traineddata https://github.com/tesseract-ocr/tessdata/raw/master/fas.traineddata


RUN apt install -y python3-pip
RUN pip install -U deep_translator

RUN curl https://nodejs.org/dist/v14.17.3/node-v14.17.3-linux-x64.tar.xz | tar -Jxf - --strip-components=1 -C /usr/local

ADD webapp /webapp
WORKDIR /webapp
RUN npm install -g node-dev
RUN npm install
CMD node-dev server.js