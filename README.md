# vipien

A wireguard based dockerized vpn.

Run with:

    docker run --rm \
        -it --name vipien \
        --cap-add sys_module \
        --cap-add net_admin \
        -p 51820:51820/udp ferama/vipien

Get the conf with:

    docker exec -it vipien cat /config/peers/1.conf

    
