#!/bin/bash

guess_public_ip() {
    if [ -e /var/run/secrets/kubernetes.io/serviceaccount/token ]
    then
        if [ -z $SERVICE_NAME ]; then
            echo "$(date): running in k8s but no SERVIVCE_NAME env set"
            exit 1
        fi
        kubectl config set-cluster vpn --server=https://kubernetes.default --certificate-authority=/var/run/secrets/kubernetes.io/serviceaccount/ca.crt
        kubectl config set-context vpn --cluster=vpn
        kubectl config set-credentials user --token=$(cat /var/run/secrets/kubernetes.io/serviceaccount/token)
        kubectl config set-context vpn --user=user
        kubectl config use-context vpn
        server_url=$(kubectl get svc $SERVICE_NAME -o=jsonpath="{.status.loadBalancer.ingress[0].ip}")
        echo $server_url
        return
    fi
    public_ip=$(curl -s ifconfig.co)
    echo $public_ip
}

nextip() {
    ip=$1
    ip_hex=$(printf '%.2X%.2X%.2X%.2X\n' `echo $ip | sed -e 's/\./ /g'`)
    next_ip_hex=$(printf %.8X `echo $(( 0x$ip_hex + 1 ))`)
    next_ip=$(printf '%d.%d.%d.%d\n' `echo $next_ip_hex | sed -r 's/(..)/0x\1 /g'`)
    echo "$next_ip"
}

init_config() {
    # initialize if not exists
    if [ ! -e /config/wg*.conf ]
    then 
        echo "$(date): wireguard init config - /config/wg0.conf"
        wg genkey | tee /config/wg0.key | wg pubkey > /config/wg0.pub
        server_key=`cat /config/wg0.key`
        server_address=$(nextip $INTERNAL_SUBNET)

        wg genkey | tee /config/server.key | wg pubkey > /config/server.pub
        server_pub=`cat /config/server.pub`

        cat > /config/wg0.conf << EOF
[Interface]
Address = $server_address/24
ListenPort = 51820
PrivateKey = $server_key
PostUp = iptables -A FORWARD -i %i -j ACCEPT; iptables -A FORWARD -o %i -j ACCEPT; iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE
PostDown = iptables -D FORWARD -i %i -j ACCEPT; iptables -D FORWARD -o %i -j ACCEPT; iptables -t nat -D POSTROUTING -o eth0 -j MASQUERADE
EOF
        # create clients dir if not exists
        [ -d /config/peers ] || mkdir -p /config/peers
        nextpeerip=$(nextip $server_address)
        echo $nextpeerip > /config/nextpeerip
    fi

   
}

wg_up() {
    for conf in /config/wg*.conf
	do
        echo "$(date): wireguard up interface - $conf"
        wg-quick up $conf
    done
	
	for name in /config/peers/*.pub
	do
		pub=`cat $name`
		conf=${name/pub/conf}
		ip=`awk '/Address/{print $3}' $conf|awk -F\/ '{print $1}'`
		wg set wg0 peer $pub allowed-ips $ip
	done
}

# put down the vpn interface
wg_down() {
    for conf in /config/wg*.conf
	do
        echo "$(date): wireguard down interface - $conf"
        wg-quick down $conf
    done
}

# creates peer conf
add_peer() {
    name=$1
    if [ ! -e "/config/peers/$name.pub" ]
    then
        wg genkey | tee /config/peers/$name.key | wg pubkey > /config/peers/$name.pub
        server_pub=`cat /config/wg0.pub`
	    client_key=`cat /config/peers/$name.key`
    fi

    peer_ip=`cat /config/nextpeerip`
    nextpeerip=$(nextip $peer_ip)
    echo $nextpeerip > /config/nextpeerip
    # create config
	cat > /config/peers/$name.conf << EOF
[Interface]
PrivateKey = $client_key
Address = $peer_ip/32
DNS = $DNS

[Peer]
PublicKey = $server_pub
AllowedIPs = $ALLOWED_IPS
Endpoint = $SERVER_PUBLIC_URL:$SERVER_PUBLIC_PORT
EOF
}

# Handle shutdown behavior
finish () {
    echo "$(date): stopping wireguard"
    wg_down
    exit 0
}


#### MAIN ####

SERVER_PUBLIC_PORT="${SERVER_PUBLIC_PORT:-51820}"
INTERNAL_SUBNET="${INTERNAL_SUBNET:-10.13.16.0}"
ALLOWED_IPS="${ALLOWED_IPS:-0.0.0.0/0}" # vpn routed ips / net
PEERS_COUNT=${PEERS_COUNT:-1}

SERVER_PUBLIC_URL="${SERVER_PUBLIC_URL-$(guess_public_ip)}"
DNS=$(cat /etc/resolv.conf  | grep nameserver | awk '{print $2}')

echo "==========================================="
printf "%-20s %s\n" "Server port" "$SERVER_PUBLIC_PORT"
printf "%-20s %s\n" "Internal subnet" "$INTERNAL_SUBNET"
printf "%-20s %s\n" "Allowed Ips" "$ALLOWED_IPS"
printf "%-20s %s\n" "Server Url" "$SERVER_PUBLIC_URL"
printf "%-20s %s\n" "DNS" "$DNS"
echo "==========================================="


sysctl -w net.ipv4.ip_forward=1
sysctl -w net.ipv4.conf.all.src_valid_mark=1

init_config
for i in $(seq 1 $PEERS_COUNT); do 
    add_peer $i
done
wg_up
trap finish TERM INT QUIT

while inotifywait -e modify -e create /config
do
	wg_down
	wg_up
done