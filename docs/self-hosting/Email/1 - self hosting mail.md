---
id: self-hosting-mail
slug: /self-hosting-mail
# Display h2 to h5 headings
toc_min_heading_level: 2
toc_max_heading_level: 5
title: Self-Hosting Email Overview
description: "Comprehensive guide to self-hosting your own email server using Stalwart Mail Server, WireGuard VPN, and AWS infrastructure. Learn about requirements, security, and setup."
---
# Self-hosting a mail server

Hosting your own mail server can seem daunting, but once you understand
the components and realize we can utilize an all-in-one solution to
do the heavy lifting it doesn't seem as overwhelming.

Pros to self-hosting:

* Complete control over where your email data resides
* You control who has access to your data
* You are not reliant on a third party to host your data who may
  * inject ads while viewing
  * establish quotas for how much mail you can store

Cons to self-hosting:

* Email is a mission critical application and any lengthy outage can cause important information to be lost (SMTP RFC 5321 section 4.5.4.1 recommends emails be retried for at least 4 days)
  * Password resets
  * Time-sensitive data
* Improper adherence to email standards will cause your emails to be rejected or delivered to SPAM folders

After having hosted my own mail server using [QMail](https://cr.yp.to/qmail.html), [dovecot](https://www.dovecot.org/), [SpamAssassin](https://spamassassin.apache.org/), and [CentOS](https://www.centos.org/) for over a decade I decided it was time to update the stack.

As much as I loved the philosophy behind QMail and it having been rock solid for so long the issues with patching in support for things like TLS and DKIM and a myriad of other things made me decide to look for an alternative.  A big thank you to [D. J. Bernstein](https://cr.yp.to/djb.html) and [John M. Simpson](https://qmail.jms1.net/) I couldn't have done it without you.

## Requirements

I want a solution which:

* is completely self contained requiring **NO** 3rd party hosted components
* minimizes cost as much as possible
  * While possible to do this even cheaper I wanted to strike a balance between features, complexity, reliability, and control
* is fully containerized

A complete mail hosting solution requires:

1. Domain Registration
1. DNS Hosting
1. All-in-one MTA Software - IMAP / JMAP server for client access
1. Public static IP w/ reverse IP mapping
1. Virtual Private Server (VPS) to forward the traffic from the static IP in the cloud to my self hosted solution
1. Everything should be done using IaC

## Components

### Domain Registration

There are many options for domain registration. I have been using AWS professionally for a long time and is where I register my domains.

### Domain hosting

While cloud hosted DNS is relatively inexpensive it is one more cost which can be removed. Serving the domain yourself also gives flexibility in how it is managed. For this we use BIND 9 in a container.

### MTA software

Having been through many many years of bare metal Linux and working with VMs it is now containers time to shine. Almost any solution I was looking at would allow for a container based solution.

There are a number of resources for discovering self hosted options (https://awesome-selfhosted.net/ specifically their [Communication - Email - Complete Solutions](https://awesome-selfhosted.net/tags/communication---email---complete-solutions.html) section was a great resource.

I spent a fair amount of time analyzing my options. MailCow, Mail-in-a-Box, and others were all in the running. What I settled on was [Stalwart Mail Server](https://stalw.art/). It is an all-in-one solution built using Rust. I've been very impressed with the feature set and community. They recently [presented](https://fosdem.org/2025/schedule/event/fosdem-2025-4571-stalwart-mail-server/) at the [FOSDEM 2025 conference](https://fosdem.org/2025/). Their presentation ([slide deck](https://stalw.art/slides/)) gives a great overview of the software and summarizes why I'm excited about it.

>Secure and Modern All-in-One Mail Server featuring:
>
>* SMTP, JMAP, IMAP4, POP3 and ManageSieve server
>* Built-in spam and phishing filter
>* Web-based administration
>* Scalable & Robust
>* Modern & Programmable
>* Secure & Memory safe
>* Available for Unix, Windows and Docker

### Public static IP w/ reverse IP mapping

We utilize [AWS Elastic IP](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/elastic-ip-addresses-eip.html) with a [reverse DNS entry](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/Using_Elastic_Addressing_Reverse_DNS.html) for the following reasons:

* DNS Hosting - Hosting a DNS zone requires a static IP.

* Spam Prevention & Reputation - Many mail servers perform a reverse DNS lookup on incoming connections to verify if the sending IP address resolves to a legitimate domain. If no valid rDNS record is found, emails may be rejected or flagged as spam.

* SMTP Server Trustworthiness - Email providers such as Gmail, Outlook, and Yahoo consider rDNS records as part of their spam filtering criteria. A missing or mismatched PTR record can cause your emails to be rejected or marked as spam.

* Compliance with Email Standards - RFCs (such as RFC 1912 and RFC 5321) recommend that mail servers have a proper rDNS setup. Some organizations strictly enforce this requirement to reduce spam and phishing attacks.

* Improved Deliverability - Email systems like SpamAssassin and other anti-spam measures often assign a higher spam score to messages from servers without an rDNS record. A properly configured PTR record can help ensure your emails reach the recipient’s inbox.

### VPS to forward the traffic from the static IP in the cloud

We use an Amazon EC2 instance running on a t4g.nano to host a WireGuard server and forward all requests for DNS, SMTP, IMAP, and other associated ports back to our home server.

### IaC for everything

We use [Terraform](https://www.terraform.io/) to construct the required cloud components including: static IP, EC2 instance for proxying traffic.
