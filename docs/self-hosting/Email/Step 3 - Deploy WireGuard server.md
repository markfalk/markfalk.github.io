---
id: self-hosting-mail-wireguard
slug: /self-hosting-mail/wireguard
---
# Step 3 - Deploy WireGuard server

With the `terraform.tfvars` file properly populated it is time to deploy
the AWS infrastructure.  This will create 19 resources including:

* Virtual Private Cloud (VPC) to hold our infrastructure
  * Internet Gateway
  * 2 public subnets
  * Routing tables
  * Security groups to allow access to the EC2 instance
* Systems Manager (SSM) Parameter Store entry containing the private wireguard key
* EC2 instance behind an auto scaling group (ASG) allowing new instances to launch in case of a failure
* Elastic IP (EIP) which will be the public static IP address which we will use to host our domain and our email server
* Necessary IAM roles to allow association of the EIP to the EC2 instance

Execute:

```bash
terraform apply
```

<details>
  <summary>Terraform apply example output:</summary>

```txt
>terraform apply
module.ec2.data.aws_caller_identity.current: Reading...
module.ec2.data.aws_region.current: Reading...
module.ec2.data.aws_region.current: Read complete after 0s [id=us-west-2]
module.s3_dynamodb.aws_dynamodb_table.terraform_locks: Refreshing state... [id=terraform-state-lock]
module.s3_dynamodb.aws_s3_bucket.terraform_state: Refreshing state... [id=stalwart-wgproxy-example.com]
module.ec2.data.aws_caller_identity.current: Read complete after 0s [id=615299775278]
module.s3_dynamodb.aws_s3_bucket_versioning.versioning_example: Refreshing state... [id=stalwart-wgproxy-example.com]

Terraform used the selected providers to generate the following execution plan.
Resource actions are indicated with the following symbols:
  + create
 <= read (data resources)

Terraform will perform the following actions:
...

Plan: 19 to add, 0 to change, 0 to destroy.

Changes to Outputs:
  + eip_id = (known after apply)

Do you want to perform these actions?
  Terraform will perform the actions described above.
  Only 'yes' will be accepted to approve.

  Enter a value: yes

module.ec2.aws_iam_policy.ec2_eni_policy: Creating...
module.ec2.aws_iam_policy.ec2_ssm_ps_policy: Creating...
module.ssm.aws_ssm_parameter.wg_config: Creating...
aws_eip.ec2_eip: Creating...
module.ec2.aws_iam_role.wp_role: Creating...
module.vpc.aws_vpc.main: Creating...
module.ssm.aws_ssm_parameter.wg_config: Creation complete after 0s [id=WireGuardConfig]
module.ec2.aws_iam_policy.ec2_ssm_ps_policy: Creation complete after 1s [id=arn:aws:iam::615299775278:policy/ec2-ssm-policy]
module.ec2.aws_iam_policy.ec2_eni_policy: Creation complete after 1s [id=arn:aws:iam::615299775278:policy/ec2_eni_policy]
module.ec2.aws_iam_role.wp_role: Creation complete after 1s [id=ec2_wp_role]
module.ec2.aws_iam_role_policy_attachment.wp_ssm_attach: Creating...
module.ec2.aws_iam_role_policy_attachment.wp_eni_attach: Creating...
module.ec2.aws_iam_role_policy_attachment.wp_ssm_ps_attach: Creating...
module.ec2.aws_iam_instance_profile.wp_instance_profile: Creating...
aws_eip.ec2_eip: Creation complete after 1s [id=eipalloc-032eba4c5c3f1f97e]
module.ec2.aws_iam_role_policy_attachment.wp_eni_attach: Creation complete after 0s [id=ec2_wp_role-20250314183301725700000001]
module.ec2.aws_iam_role_policy_attachment.wp_ssm_attach: Creation complete after 0s [id=ec2_wp_role-20250314183301736900000002]
module.ec2.aws_iam_role_policy_attachment.wp_ssm_ps_attach: Creation complete after 0s [id=ec2_wp_role-20250314183301747200000003]
module.ec2.aws_iam_instance_profile.wp_instance_profile: Creation complete after 6s [id=ec2_wp_instance_profile]
module.vpc.aws_vpc.main: Still creating... [10s elapsed]
module.vpc.aws_vpc.main: Still creating... [20s elapsed]
module.vpc.aws_vpc.main: Creation complete after 23s [id=vpc-07066218db9d75b34]
module.vpc.aws_internet_gateway.igw: Creating...
module.vpc.aws_subnet.public[1]: Creating...
module.vpc.aws_subnet.public[0]: Creating...
module.vpc.aws_security_group.instance_sg: Creating...
module.vpc.aws_internet_gateway.igw: Creation complete after 0s [id=igw-0b79d3ee351e8f2e2]
module.vpc.aws_route_table.public: Creating...
module.vpc.aws_route_table.public: Creation complete after 2s [id=rtb-048bd8e56997862c0]
module.vpc.aws_security_group.instance_sg: Creation complete after 3s [id=sg-00728d1b5c7b41f59]
module.vpc.aws_subnet.public[0]: Still creating... [10s elapsed]
module.vpc.aws_subnet.public[1]: Still creating... [10s elapsed]
module.vpc.aws_subnet.public[0]: Creation complete after 11s [id=subnet-05a1fd10386ebb081]
module.vpc.aws_subnet.public[1]: Creation complete after 11s [id=subnet-0c1521cbe78fcb88e]
module.vpc.aws_route_table_association.public_subnet_assoc[0]: Creating...
module.vpc.aws_route_table_association.public_subnet_assoc[1]: Creating...
module.ec2.aws_launch_template.ec2_launch_template: Creating...
module.vpc.aws_route_table_association.public_subnet_assoc[1]: Creation complete after 1s [id=rtbassoc-00eb9c5921f72b784]
module.vpc.aws_route_table_association.public_subnet_assoc[0]: Creation complete after 1s [id=rtbassoc-08e1fdc355d50624b]
module.ec2.aws_launch_template.ec2_launch_template: Creation complete after 6s [id=lt-0bffda5aa392ff9a7]
data.aws_launch_template.latest: Reading...
data.aws_launch_template.latest: Read complete after 0s [id=lt-0bffda5aa392ff9a7]
aws_autoscaling_group.ec2_asg: Creating...
```

</details>

:::note
You may receive the following error:

```txt
╷
│ Error: waiting for Auto Scaling Group (terraform-20250314183341031000000007) capacity satisfied: scaling activity (9fa65657-bc1b-ae49-43ab-0becd80cf5d6): Failed: Authentication Failure. Launching EC2 instance failed.
│
│   with aws_autoscaling_group.ec2_asg,
│   on main.tf line 38, in resource "aws_autoscaling_group" "ec2_asg":
│   38: resource "aws_autoscaling_group" "ec2_asg" {
│
╵
```

Which was shortly followed up by an email from AWS:
> Dear AWS Customer,
>
>You recently requested an AWS service that required additional validation. Your request has now been validated for AWS US West (Oregon) Region(s). If you're still experiencing difficulty, then contact us through the Support Center: (please click here)
>
>Sincerely,
>Amazon Web Services
>This message was produced and distributed by Amazon Web Services, Inc. and affiliates, 410 Terry Ave. North, Seattle, WA 98109-5210.

The stack actually did deploy and did launch an EC2 instance, but because it was the first time launching in a new region it threw that error.

Simply run the apply again to update the Auto-Scaling Group (ASG).

You should see the following output:

```txt
Apply complete! Resources: 1 added, 0 changed, 1 destroyed.

Outputs:

eip_id = "eipalloc-#################"
eip_ip = "xxx.xxx.xxx.xxx"

:::

Otherwise you should see the following output:

```txt
Apply complete! Resources: 19 added, 0 changed, 0 destroyed.

Outputs:

eip_id = "eipalloc-#################"
eip_ip = "xxx.xxx.xxx.xxx"
```

At this point it would be worth checking that the IP you were assigned from AWS is clean.  AWS Terms of Service prohibit spamming and running malicious sites so their IP address space should be clean, but it's still good to validate the reputation of the IP assigned.

You can check the IP against a couple of reputation providers:

* https://mxtoolbox.com/blacklists.aspx
* https://ipremoval.sms.symantec.com/lookup
* https://www.spamhaus.org/ip-reputation/
* https://www.proofpoint.com/us/ipcheck

If you determine your assigned IP is tainted you can destroy the stack and re-create it to obtain another IP address.
