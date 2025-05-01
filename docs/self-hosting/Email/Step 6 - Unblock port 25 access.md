---
id: self-hosting-mail-unblock
slug: /self-hosting-mail/unblock
title: Unblock Port 25 Access
description: "Guide to unblocking AWS EC2 port 25 for email server setup. Learn how to request AWS limits increase, verify port access, and troubleshoot common connectivity issues."
---
# Step 6 - Unblock port 25 access

We need to inform AWS that we're standing up a mail server for our personal user and that
they need to allow us to make outbound connections on port 25 from our EC2 instance.  This
is a spam prevention policy that AWS and other vendors typically use to prevent spammers from
using their infrastructure to send spam. I had to do something similar when I was using AT&T
with static IPs.

The situation is discussed in this [blog post](https://repost.aws/knowledge-center/ec2-port-25-throttle)

You will need to submit the [Request to remove email sending limitations](https://support.console.aws.amazon.com/support/contacts#/rdns-limits) form with an explanation of your use case for running a private email server. It can take a while for the request to process.  My last request took 5 hours before I received the confirmation.

This is the content of the request I sent:

>I am requesting the removal of email sending limitations for my EC2 instance, which is used to self-host a personal mail server for my family’s domain. The mail server is based on Stalwart Mail and is configured similarly to the solutions outlined in AWS’s blog post on deploying an open-source mail server: https://aws.amazon.com/blogs/opensource/fully-automated-deployment-of-an-open-source-mail-server-on-aws/
>
>The intended usage is to send and receive a small volume of legitimate personal emails within my family. This setup does not involve bulk emailing, marketing, or unsolicited mail.
>
>To ensure compliance with AWS policies and prevent misuse, I have implemented the following security measures:
>
>SPF, DKIM, and DMARC records are properly configured to authenticate outgoing emails.
>Reverse DNS (PTR) records are set up correctly for the mail server.
>The mail server enforces rate limits and blocks unauthorized relay attempts.
>Logs and monitoring tools are in place to detect and mitigate any potential abuse.
>I appreciate your consideration of this request and am happy to provide additional details if needed.
