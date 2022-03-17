FROM node:16-alpine as uibuilder
WORKDIR /src
COPY pkg/ui .
RUN npm install && npm run build

# go backend builder
FROM golang:1.17 as gobuilder
WORKDIR /app
COPY . .
COPY --from=uibuilder /src/build pkg/ui/build
RUN go build \
	-trimpath \
	-ldflags="-s -w" \
    -o /vipien .


FROM ubuntu:latest

RUN set -eux; \
	apt-get update; \
	apt-get install -y --no-install-recommends \
		ca-certificates \
		wireguard-tools \
		inotify-tools \
		iptables \
		iproute2 \
		net-tools \
		curl; \
    rm -r /var/lib/apt/lists /var/cache/apt/archives

# install kubectl
RUN \
	cd /tmp; \ 
    curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"; \
    chmod +x kubectl && mv kubectl /usr/local/bin 

VOLUME /config

# wireguard
EXPOSE 51820/udp

# rest api
EXPOSE 8080/tcp

COPY ./bin/* /usr/local/bin/
COPY --from=gobuilder /vipien /usr/local/bin/vipien

ENTRYPOINT ["entrypoint.sh"]