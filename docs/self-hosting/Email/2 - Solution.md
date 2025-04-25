# The Solution

import useBaseUrl from '@docusaurus/useBaseUrl';
import ThemedImage from '@theme/ThemedImage';

<ThemedImage
  sources={{
    light: useBaseUrl('/img/self-hosted-mail-light.svg'),
    dark: useBaseUrl('/img/self-hosted-mail-dark.svg'),
  }}
  alt="Themed Images"
/>

We run the Stalwart mail server and BIND on our self-hosted server. It connects via WireGuard to an AWS EC2 instance with a public Elastic IP.

The EC2 instance is setup to forward all inbound Internet traffic over the required ports to the self-hosted server on the other end of the WireGuard tunnel.

The EC2 instance is only running the WireGuard server from a Docker container.

The self-hosted server is only running a WireGuard client  the Stalwart mail server and BIND.

All mail clients, and remote MTAs communicate directly with the self-hosted mail server by sending traffic to the EC2 instance which routes traffic over WireGuard. Clients and MTAs have no knowledge of the self-hosted server.
