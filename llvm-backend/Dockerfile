FROM ubuntu:22.04

RUN apt-get update && apt-get install -y \
    curl \
    gnupg \
    lsb-release \
    software-properties-common \
    wget \
    sudo

RUN curl -fsSL https://deb.nodesource.com/setup_lts.x | bash - && \
    apt-get install -y nodejs && \
    node --version && \
    npm --version

RUN wget https://apt.llvm.org/llvm.sh && \
    chmod +x llvm.sh && \
    sudo ./llvm.sh 16 && \
    sudo ./llvm.sh 17 && \
    sudo ./llvm.sh 18

RUN clang-16 --version && \
    clang-17 --version && \
    clang-18 --version

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

CMD ["npm", "start"]