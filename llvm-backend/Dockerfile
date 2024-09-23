FROM ubuntu:22.04

RUN apt-get update && apt-get install -y \
    curl \
    gnupg \
    lsb-release \
    software-properties-common \
    wget

# Add NodeSource PPA
RUN curl -fsSL https://deb.nodesource.com/setup_lts.x | bash - && \
    apt-get install -y nodejs && \
    node --version && \
    npm --version

# use bash -c "$(wget -O - https://apt.llvm.org/llvm.sh)"
RUN bash -c "$(wget -O - https://apt.llvm.org/llvm.sh)"
# add llvm to path
RUN clang-18 --version

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

CMD ["npm", "start"]