# Step 1 - Clone Repository and Generate WireGuard Key Pairs

## Clone the repository

Clone the repository with the following command:

```bash
git clone https://github.com/markfalk/stalwart-mail-wgproxy.git
```

## Generate WireGuard Key Pairs

Use the following docker commands to generate private and public key pairs in the current directory for the server and the client:

```bash
echo "This can take upwards of 20 seconds to generate the 4 keys..."
docker run --rm -i --cap-add=NET_ADMIN --cap-add=SYS_MODULE linuxserver/wireguard:latest wg genkey 2>/dev/null | tail -1 > server-privatekey
docker run --rm -i --cap-add=NET_ADMIN --cap-add=SYS_MODULE linuxserver/wireguard:latest wg pubkey < server-privatekey 2>/dev/null | tail -1 > server-publickey
docker run --rm -i --cap-add=NET_ADMIN --cap-add=SYS_MODULE linuxserver/wireguard:latest wg genkey 2>/dev/null | tail -1 > client-privatekey
docker run --rm -i --cap-add=NET_ADMIN --cap-add=SYS_MODULE linuxserver/wireguard:latest wg pubkey < client-privatekey 2>/dev/null | tail -1 > client-publickey
```
