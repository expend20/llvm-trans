FROM ubuntu:22.04

RUN apt-get update && apt-get install -y \
    curl \
    gnupg \
    lsb-release \
    software-properties-common \
    wget \
    sudo \
    unzip

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

# Download release .zip file https://github.com/expend20/llvm-ob-passes/releases/download/release-20241011033003/libpasses.zip
RUN wget https://github.com/expend20/llvm-ob-passes/releases/download/release-20241011033003/libpasses.zip && \
    unzip libpasses.zip -d /app && \
    chmod +x /app/wrapper && \
    rm libpasses.zip

WORKDIR /app

COPY package*.json ./
RUN npm install

RUN npm install -g nodemon ts-node

COPY . .

CMD ["nodemon", "--watch", "src", "--ext", "ts,json", "--exec", "ts-node", "src/index.ts"]