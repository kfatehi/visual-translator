FROM nvidia/cuda:11.8.0-cudnn8-devel-ubuntu22.04

ARG DEBIAN_FRONTEND=noninteractive
ARG TZ=UTC
ARG MINICONDA_VERSION=23.1.0-1
ARG PYTHON_VERSION=3.9.13

RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone
RUN apt-get update
RUN apt install -y curl wget git ffmpeg
RUN adduser --disabled-password --gecos '' --shell /bin/bash user
USER user
ENV HOME=/home/user
WORKDIR $HOME
RUN mkdir $HOME/.cache $HOME/.config && chmod -R 777 $HOME
RUN wget https://repo.anaconda.com/miniconda/Miniconda3-py39_$MINICONDA_VERSION-Linux-x86_64.sh
RUN chmod +x Miniconda3-py39_$MINICONDA_VERSION-Linux-x86_64.sh
RUN ./Miniconda3-py39_$MINICONDA_VERSION-Linux-x86_64.sh -b -p /home/user/miniconda
ENV PATH="$HOME/miniconda/bin:$PATH"
RUN conda init
RUN conda install python=$PYTHON_VERSION
RUN python3 -m pip install --upgrade pip
RUN pip3 install torch torchvision torchaudio --extra-index-url https://download.pytorch.org/whl/cu118


ENV ARGOS_DEVICE_TYPE=cuda
RUN pip install argostranslate
USER root
RUN apt install -y tesseract-ocr
RUN curl https://nodejs.org/dist/v14.17.3/node-v14.17.3-linux-x64.tar.xz | tar -Jxf - --strip-components=1 -C /usr/local
RUN npm i -g node-dev
USER user

ENV ARGOS_PACKAGES_DIR=/argos
ENV TESSDATA_PREFIX=/tess

RUN mkdir $HOME/app
WORKDIR $HOME/app

ADD --chown=user:user package.json .
ADD --chown=user:user package-lock.json .
RUN npm install
ADD --chown=user:user . $HOME/app
CMD node-dev server.js