#  docker run --rm -it --name wg \
# 	--cap-add sys_module \
# 	--cap-add net_admin \
# 	-p 51820:51820/udp wg

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

COPY ./entrypoint.sh /
ENTRYPOINT ["/entrypoint.sh"]