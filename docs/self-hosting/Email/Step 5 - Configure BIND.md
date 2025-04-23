# Step 5 - Configure BIND

Using the web terminal update the permissions on the `cache` directory and create the `log` directory.

```bash
chmod 777 /mnt/user/appdata/bind/cache/bind
mkdir -p /mnt/user/appdata/bind/var/log/bind
chmod -R 777 /mnt/user/appdata/bind/var/log
```

In the below examples replace `example.com` with your actual domain name and `<AWS EIP>` with your AWS EIP.

Using an editor create the `/mnt/user/appdata/bind/etc/named.conf` file. You can use [this project template file](https://github.com/markfalk/stalwart-mail-wgproxy/blob/main/bind/named.conf.template) as a template.

```txt title="/mnt/user/appdata/bind/etc/named.conf"
options {
        directory "/var/cache/bind";
        listen-on { any; };
        listen-on-v6 { any; };
        allow-recursion {
                none;
        };
        allow-transfer {
                none;
        };
        allow-update {
                none;
        };
};

zone "example.com." {
        type primary;
        file "/var/lib/bind/db.example.com";
        notify explicit;
};
```

Using an editor create the `/mnt/user/appdata/bind/lib/bind/db.<YOUR DOMAIN>` file. Substitute `<YOUR DOMAIN>` with your actual domain name.  You can use [this project template file](https://github.com/markfalk/stalwart-mail-wgproxy/blob/main/bind/db.yourdomain.tld.template) as a template.

```txt title="/mnt/user/appdata/bind/lib/bind/db.example.com"
$ORIGIN .
$TTL 3600       ; 1 hour
example.com             IN SOA  ns1.example.com. postmaster.example.com. (
                                1970010101 ; serial
                                10800      ; refresh (3 hours)
                                900        ; retry (15 minutes)
                                2592000    ; expire (4 weeks 2 days)
                                3600       ; minimum (1 hour)
                                )
                        NS      ns1.example.com.
                        NS      ns2.example.com.
$TTL 300        ; 5 minutes
                        A       <AWS EIP>
$ORIGIN example.com.
$TTL 3600       ; 1 hour
ns1                     A       <AWS EIP>
ns2                     A       <AWS EIP>
mail                    A       <AWS EIP>
```

## Test DNS resolution against your BIND server directly

Use dig or nslookup to query the BIND server directly.

```txt title="dig example"
>dig ns1.example.com @<AWS EIP>

; <<>> DiG 9.20.3 <<>> ns1.example.com @<AWS EIP>
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 33527
;; flags: qr aa rd; QUERY: 1, ANSWER: 1, AUTHORITY: 0, ADDITIONAL: 1
;; WARNING: recursion requested but not available

;; OPT PSEUDOSECTION:
; EDNS: version: 0, flags:; udp: 1232
; COOKIE: 0888d0b3a11e1c880100000067db8aa6019403282f8bfc78 (good)
;; QUESTION SECTION:
;ns1.example.com.               IN      A

;; ANSWER SECTION:
ns1.example.com.        3600    IN      A       <AWS EIP>

;; Query time: 58 msec
;; SERVER: <AWS EIP>#53(<AWS EIP>) (UDP)
;; WHEN: Wed Mar 19 20:25:26 PDT 2025
;; MSG SIZE  rcvd: 88
```

This shows that query was directly against the `<AWS EIP>` and it returned and answer for `ns1.example.com` with the corresponding `<AWS EIP>`

```txt title="nslookup example"
>nslookup ns1.example.com <AWS EIP>
Server:         <AWS EIP>
Address:        <AWS EIP>#53

Name:   ns1.example.com
Address: <AWS EIP>
```

## Add glue records with your registrar

All registrars let you create glue records which let you set the nameserver for the domain to a record within the domain..

[AWS Procedure](https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/domain-name-servers-glue-records.html)

[Porkbun Procedure](https://kb.porkbun.com/article/112-how-to-host-your-own-nameservers-with-glue-records)

Once your glue records are in place you can update the nameservers for your domain with your registrar to point to `ns1.<YOUR DOMAIN>` and `ns2.<YOUR DOMAIN>`. It is okay to have them both point to the same IP.

## Test DNS resolution against your BIND server remotely

DNS propagation, including glue records, can take anywhere from a few minutes to 48 hours, depending on factors like time-to-live (TTL) settings and DNS cache.

From my experience it is usually on the shorter end.

Use `dig` or `nslookup` to query the BIND server using cloudflare, google public DNS or your own resolver.

```txt title="dig example"
>dig ns1.example.com @1.1.1.1

; <<>> DiG 9.20.3 <<>> ns1.example.com @<AWS EIP>
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 33527
;; flags: qr aa rd; QUERY: 1, ANSWER: 1, AUTHORITY: 0, ADDITIONAL: 1
;; WARNING: recursion requested but not available

;; OPT PSEUDOSECTION:
; EDNS: version: 0, flags:; udp: 1232
; COOKIE: 0888d0b3a11e1c880100000067db8aa6019403282f8bfc78 (good)
;; QUESTION SECTION:
;ns1.example.com.               IN      A

;; ANSWER SECTION:
ns1.example.com.        3600    IN      A       <AWS EIP>

;; Query time: 58 msec
;; SERVER: 1.1.1.1#53(1.1.1.1) (UDP)
;; WHEN: Wed Mar 19 20:25:26 PDT 2025
;; MSG SIZE  rcvd: 88
```

This shows that query was directly against Cloudflare's public DNS (1.1.1.1) and it returned and answer for `ns1.example.com` with the corresponding `<AWS EIP>`
