FROM ubuntu:20.04

RUN apt-get update -y && apt-get upgrade -y

# Node
# https://github.com/nodesource/distributions#nodejs
ENV NODE_MAJOR=18
RUN apt-get install -y ca-certificates curl gnupg
RUN mkdir -p /etc/apt/keyrings
RUN curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg
RUN echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_${NODE_MAJOR}.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list
RUN apt-get update -y
RUN apt-get install -y nodejs

# C++
RUN apt-get install -y cmake g++

# libssl-dev
# https://www.claudiokuenzler.com/blog/1216/could-not-find-openssl-error-compiling-cmake-source
RUN apt-get install -y libssl-dev

# Git
RUN apt-get install -y git

WORKDIR /home/node-datachannel
