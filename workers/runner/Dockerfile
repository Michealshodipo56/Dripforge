FROM node:22-bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends git ca-certificates python3 make g++ && rm -rf /var/lib/apt/lists/* && useradd -u 10001 -m agent
COPY workers/runner/index.mjs /opt/dripforge/agent.mjs
USER 10001:10001
WORKDIR /workspace
CMD ["node","/opt/dripforge/agent.mjs"]
