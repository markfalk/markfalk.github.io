---
id: self-hosting-mail-debug
slug: /self-hosting-mail/debug
title: Debugging Guide
description: "Comprehensive troubleshooting guide for self-hosted email servers. Covers common issues with Stalwart Mail Server, WireGuard connectivity, and DNS configuration."
---
# debugging

If your [sending](Step%208%20-%20Test%20sending%20and%20receiving.md#test-email-sending) and [receiving](Step%208%20-%20Test%20sending%20and%20receiving.md#test-email-reception) tests are failing follow these steps to identify the issue.

## Is DNS properly resolving

Validate using `nslookup` or `dig` and validate you are resolving to the AWS EIP

## Are services available over the Internet

Check Internet connectivity with `nmap`, `telnet`, or `curl` to validate ports are connecting.

## Validate WireGuard tunnel connectivity

### WireGuard client side

Get a shell on the Unraid WireGuard client through the UI from the docker tab or with the following command in an Unraid terminal window:

Check wireguard tunnel with:

```bash
docker exec -it wireguard bash
```

```txt title="Example output"
interface: wg0
  public key: m4ymkSaglCR7ioW3YQiQ7o3BKdUgyEkjEGOr5sAU8mA=
  private key: (hidden)
  listening port: 51820
  fwmark: 0xca6c

peer: MUYjZiRO/Q5wO8Uu5xkzxRNWS0HEMXys3iAVKY6OtUM=
  endpoint: <AWS EIP>:51820
  allowed ips: 0.0.0.0/0
  latest handshake: 2 minutes, 6 seconds ago
  transfer: 6.55 GiB received, 12.44 GiB sent
```

Validate that the peer is showing up and that there has been a handshake.

### WireGuard server side

Get a shell on the EC2 instance using either EC2 Instance Connect in the console or using the IPv6 method if you specified your IPv6 ranges in the `terraform.tfvars` file:

The IPv6 way:

```bash
aws ec2-instance-connect ssh --instance-id i-0e270461cbb452d9d --connection-type direct --instance-ip <IPV6 from console or CLI query>
```

Check tunnel on server side:

```txt
[root@ip-10-42-1-207 ec2-user]# docker ps
CONTAINER ID   IMAGE                   COMMAND   CREATED        STATUS        PORTS                                                                                                                                                                                                                                                                                                                                                           NAMES
01ce3916c3e1   linuxserver/wireguard   "/init"   18 hours ago   Up 18 hours   0.0.0.0:25->25/tcp, :::25->25/tcp, 0.0.0.0:53->53/tcp, :::53->53/tcp, 0.0.0.0:443->443/tcp, :::443->443/tcp, 0.0.0.0:465->465/tcp, :::465->465/tcp, 0.0.0.0:587->587/tcp, :::587->587/tcp, 0.0.0.0:993->993/tcp, :::993->993/tcp, 0.0.0.0:53->53/udp, :::53->53/udp, 0.0.0.0:4190->4190/tcp, :::4190->4190/tcp, 0.0.0.0:51820->51820/udp, :::51820->51820/udp   wireguard
[root@ip-10-42-1-207 ec2-user]# docker exec -it wireguard bash

root@01ce3916c3e1:/# wg show
interface: wg0
  public key: Vs14kgnUM2QVn72TLEduBf53cvGyr8N2zNq1uSW21jc=
  private key: (hidden)
  listening port: 51820
```
