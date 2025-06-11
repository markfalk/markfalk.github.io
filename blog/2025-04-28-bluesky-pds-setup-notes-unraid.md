---
slug: bluesky-pds-setup-notes-unraid
title: Bluesky PDS Setup Notes - Unraid
description: "Comprehensive guide to setting up a Bluesky Personal Data Server (PDS) on Unraid. Includes Docker configuration, SWAG proxy setup, DNS records, and troubleshooting common issues."
authors: [mark]
tags: [bluesky, social]
---

Getting Bluesky PDS set up took a bit more work then I would have liked. The software is
still under development and getting an account setup with a bare domain is something they
plan on making easier in the future.

👇👇👇 keep reading 👇👇👇
<!-- truncate -->

Resources referenced:

* https://github.com/bluesky-social/pds
* https://rafaeleyng.github.io/self-hosting-a-bluesky-pds-and-using-your-domain-as-your-handle
* https://cprimozic.net/notes/posts/notes-on-self-hosting-bluesky-pds-alongside-other-services/

There were a number of other sites discussing some of the same issues so apparently I'm not
the only one who ran into issues.

### Tailored docker-compose.yml

I took the [docker-compose.yml from the source repo](https://github.com/bluesky-social/pds/blob/main/compose.yaml) and modified it to work on my Unraid setup and not use caddy or watchtower.

```yaml title="docker-compose.yml"
services:
  pds:
    container_name: pds
    image: ghcr.io/bluesky-social/pds:0.4
    restart: unless-stopped
    volumes:
      - /mnt/user/appdata/pds:/pds
    ports:
      - "${COMPOSE_PORT_HTTP:-3002}:3000"
    env_file:
      - /mnt/user/appdata/pds/pds.env
networks:
  default:
    external: true
    name: proxynet
```

### SWAG
Setting it up to use [SWAG](https://github.com/linuxserver/docker-swag) (NGINX Proxy Manager alternative)

Note I also added an additional domain `testuser1.markfalk.com` which is required to enable additional PDS accounts if you are not using a wildcard DNS entry for the base domain. I serve other services on this domain as well and don't want to use a wildcard.

```txt title="/mnt/user/appdata/swag/nginx/site-confs/markfalk.com.conf"
server {
  ...
    server_name testuser1.markfalk.com markfalk.com;

    location /xrpc {
        proxy_pass http://pds:3000;
        proxy_set_header X-Forwarded-Proto https;
        proxy_set_header Host            $host;

        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
    }

    location /.well-known/atproto-did {
        proxy_pass http://pds:3000/.well-known/atproto-did;
        proxy_set_header Host            $host;
    }
}
```

### Generating the pds.env file

Starting from [Peter's Gist](https://gist.github.com/peter-tanner/1ede26badfd7759d38dcd46d155ecbd5) which is based on the actual
PDS install script (https://github.com/bluesky-social/pds/blob/main/installer.sh), I derived the following [Unraid compatible script](https://gist.github.com/markfalk/e14a36b16cfaa250ea5cee7cc749daac).

Example run:
```txt
root@Rocinante:/mnt/user/appdata/pds# ./create-bluesky-env.sh /mnt/user/appdata/pds
---------------------------------------
     Add DNS Record for Public IP
---------------------------------------

  From your DNS provider's control panel, create the required
  DNS record with the value of your server's public IP address.

  + Any DNS name that can be resolved on the public internet will work.
  + Replace example.com below with any valid domain name you control.
  + A TTL of 600 seconds (10 minutes) is recommended.

  Example DNS record:

    NAME                TYPE   VALUE
    ----                ----   -----
    example.com         A      Server's IP
    *.example.com       A      Server's IP

  **IMPORTANT**
  It's recommended to wait 3-5 minutes after creating a new DNS record
  before attempting to use it. This will allow time for the DNS record
  to be fully updated.

Enter your public DNS address (e.g. example.com): markfalk.com
Enter an admin email address (e.g. you@example.com): mark@markfalk.com
```

Which generates a `pds.env` file. I modified the `PDS_BLOBSTORE_DISK_LOCATION` to point under `/pds` so that it
will be written to the docker container's `/pds` mapped volume.:

```txt title="/mnt/user/appdata/pds/pds.env"
PDS_HOSTNAME=markfalk.com
PDS_JWT_SECRET=<secret>
PDS_ADMIN_PASSWORD=<password>
PDS_PLC_ROTATION_KEY_K256_PRIVATE_KEY_HEX=<private key>
PDS_DATA_DIRECTORY=/pds
PDS_BLOBSTORE_DISK_LOCATION=/pds/blocks
PDS_BLOB_UPLOAD_LIMIT=52428800
PDS_DID_PLC_URL=https://plc.directory
PDS_BSKY_APP_VIEW_URL=https://api.bsky.app
PDS_BSKY_APP_VIEW_DID=did:web:api.bsky.app
PDS_REPORT_SERVICE_URL=https://mod.bsky.app
PDS_REPORT_SERVICE_DID=did:plc:ar7c4by46qjdydhdevvrndac
PDS_CRAWLERS=https://bsky.network
LOG_ENABLED=true
PDS_SERVICE_HANDLE_DOMAINS=.markfalk.com
```

Adding SMTP settings to the file:

```txt title="/mnt/user/appdata/pds/pds.env"
PDS_EMAIL_SMTP_URL=smtps://<generated stalwart mail account user>:<password>@mail-oak.markfalk.com:465
PDS_EMAIL_FROM_ADDRESS=no-reply@markfalk.com
```

### Running the containers

Added the aforementioned `docker-compose.yml` to a new Unraid _Docker Compose Manager_ stack and launched it.

### Create the PDS account

```bash
cd /mnt/user/appdata/pds
ln -s /mnt/user/appdata/pds /pds
curl \
    --silent \
    --show-error \
    --fail \
    --output ./pdsadmin \
    https://raw.githubusercontent.com/bluesky-social/pds/main/pdsadmin.sh
chmod 755 pdsadmin
./pdsadmin account create
```

My run:
```
root@Rocinante:/mnt/user/appdata/pds# ./pdsadmin account create
Enter an email address (e.g. alice@markfalk.com): mark@markfalk.com
Enter a handle (e.g. alice.markfalk.com): alice.markfalk.com

Account created successfully!
-----------------------------
Handle   : alice.markfalk.com
DID      : did:plc:eweahknmmsa7rvtxwkucqarm
Password : <password>
-----------------------------
Save this password, it will not be displayed again.
```

One of the annoyances is that you can't create the handle as the base domain initially. I had to create it as a subdomain and then move it to the base domain later. This is well-known limitation as of this writing.

I used this trick to get the DID public via the SWAG proxy config:
```txt title="nginx/site-confs/markfalk.com.conf"
        location /.well-known/atproto-did {
                default_type text/plain;
                return 200 "did:plc:eweahknmmsa7rvtxwkucqarm";
        }
```

I added the required DNS records as well:
```nsupdate
server ns1.markfalk.com
zone markfalk.com
update delete _atproto.markfalk.com TXT
update add _atproto.markfalk.com 300 TXT "did=did:plc:eweahknmmsa7rvtxwkucqarm"
send
```

### Fixing the handle to be the base domain

I used `goat` to modify the handle to be the base domain.

On my laptop:

```bash
go install github.com/bluesky-social/indigo/cmd/goat@latest
~/go/bin/goat account login -u did:plc:eweahknmmsa7rvtxwkucqarm -p PASSWORD
~/go/bin/goat account update-handle markfalk.com
```

### Outtakes AKA issues I ran into

Modifying the `pds.env` file had no effect with only restarting the container, I had to
do a _Docker Compose Manager_ `update stack` to make it take effect.

I thought the application would read in the `pds.env` file on startup but it doesn't.

The `pds.env` file only sets the environment variables when you run `docker-compose up`. The application only uses the as
environment variables and doesn't read them in from the file.
