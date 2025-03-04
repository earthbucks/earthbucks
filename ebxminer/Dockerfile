# Dockerfile for compiling dawn-node
# Can also be used to run the miner but an Arch Linux image is simpler (see readme)
FROM nvidia/cuda:12.6.2-devel-ubuntu22.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y \
    curl \
    gnupg2 \
    lsb-release \
    software-properties-common \
    build-essential \
    git \
    cmake \
    golang \
    neovim \
    ninja-build \
    libx11-xcb-dev \
    libxrandr-dev \
    libxinerama-dev \
    libxcursor-dev \
    libxi-dev \
    && rm -rf /var/lib/apt/lists/*

RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash
RUN bash -c "source ~/.nvm/nvm.sh && nvm install 23 && nvm use 23"

RUN git clone https://chromium.googlesource.com/chromium/tools/depot_tools.git /opt/depot_tools
RUN git clone https://dawn.googlesource.com/dawn /root/dawn && cd /root/dawn \
    && cp scripts/standalone-with-node.gclient .gclient \
    && /opt/depot_tools/gclient sync
RUN mkdir /root/dawn/dawn && cd /root/dawn/dawn \
    && cmake /root/dawn -GNinja -DDAWN_BUILD_NODE_BINDINGS=1 \
    && ninja dawn.node
RUN mv /root/dawn/dawn/dawn.node /root/

ENV SHELL=bash 
RUN curl -fsSL https://get.pnpm.io/install.sh | sh -

ENV NVIDIA_DRIVER_CAPABILITIES=all

RUN apt-get update \
    && apt-get install -y \
    libxext6 \
    libvulkan1 \
    libvulkan-dev \
    vulkan-tools \
    nvidia-container-runtime \
    && rm -rf /var/lib/apt/lists/*

# Set default command
CMD ["bash"]

