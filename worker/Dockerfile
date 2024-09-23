# Use Ubuntu as the base image
FROM ubuntu:24.04

RUN deb http://apt.llvm.org/noble/ llvm-toolchain-noble-19 main
RUN deb-src http://apt.llvm.org/noble/ llvm-toolchain-noble-19 main

# Update package lists and install LLVM
RUN apt-get update && \
    apt-get install -y llvm-19 clang-19 && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Set the default command (optional)
CMD ["bash"]
