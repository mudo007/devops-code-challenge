FROM node:18

# add Github to known hosts inside the container
# RUN mkdir -p -m 0700 /root/.ssh && ssh-keyscan github.com >> /root/.ssh/known_hosts
#External volumes we will need
VOLUME /root/.kube
VOLUME /root/.config
VOLUME /root/.pulumi

# Install Pulumi
RUN curl -fsSL https://get.pulumi.com | sh

# Add Pulumi to PATH
ENV PATH=/root/.pulumi/bin:$PATH

# Google Cloud SDK
RUN echo "deb [signed-by=/usr/share/keyrings/cloud.google.gpg] http://packages.cloud.google.com/apt cloud-sdk main" | tee -a /etc/apt/sources.list.d/google-cloud-sdk.list && \
apt-get install -y apt-transport-https ca-certificates gnupg && \
curl https://packages.cloud.google.com/apt/doc/apt-key.gpg | apt-key --keyring /usr/share/keyrings/cloud.google.gpg add - && \
apt-get update && \
apt-get install -y google-cloud-sdk

# Install Husky for git hooks
RUN npx husky install


WORKDIR /app

ENTRYPOINT [ "/bin/bash" ] 