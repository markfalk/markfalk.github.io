---
id: self-hosting-mail-aws-infrastructure
slug: /self-hosting-mail/aws-infrastructure
---
# Step 2 - Setup AWS infrastructure

This project uses [Terraform](https://www.terraform.io/) to deploy the AWS infrastructure. The Terraform will deploy the following resources:

* Virtual Private Cloud (VPC) to contain our infrastructure including:
  * Subnets
  * Route Tables
  * Internet Gateway
  * Security groups to allow access to the EC2 instance
* EC2 instance to host the WireGuard server
* Auto scaling group (ASG) to allow a new instance to launch in case of a failure
* Elastic IP (EIP) which will be the public static IP address which we will use to receive traffic from the Internet through our WireGuard tunnel back to our self-hosted server
* IAM roles to allow association of the EIP to the EC2 instance
* Systems Manager (SSM) Parameter Store entry containing the WireGuard configuration including the private key
* Storage bucket (S3) to hold our Terraform state
* Database (DynamoDB) to handle Terraform locking

Install [Terraform](https://www.terraform.io/) and [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) if you have not already done so.

## Identify your domain

Identify which domain you wish to use for hosting email.

You have options for how you want to handle domain hosting.

1. Register a new domain and host it on our self-hosted server
1. Migrate an existing one to run under the new BIND 9 container
1. Manage the domain outside of this project and modify the `docker-compose.yml` file to omit the BIND 9 service

Amazon Route53 supports domain registration, but any registrar can be used.

## Determine parameters for launching the AWS stack

### AWS region

Decide which AWS region you want to use, choose one that is close to where you are located.

* [List of AWS regions](https://aws.amazon.com/about-aws/global-infrastructure/regions_az/)
* You can determine closest region using www.cloudping.info

### EC2 instance type

We do not need much compute power and can go with the cheapest options. The AWS Free Tier type can vary by region, but generally it will be the `t2.micro` instance type; `t4g.nano` is an ARM based instance type with the lowest cost outside the free tier.

### AMI

Run the `aws ssm get-parameters` command to get the latest Amazon Linux 2023 AMI for the Wireguard Proxy server.

```bash title="x86_64 us-west-2 example"
aws ssm get-parameters \
  --names /aws/service/ami-amazon-linux-latest/al2023-ami-kernel-default-x86_64 \
  --region us-west-2 --query 'Parameters[0].Value'
```

```bash title="ARM us-west-2 example"
aws ssm get-parameters \
  --names /aws/service/ami-amazon-linux-latest/al2023-ami-kernel-default-arm64 \
  --region us-west-2 --query 'Parameters[0].Value'
```

### S3 bucket name

We need to specify a globally unique name for our S3 bucket which will hold the Terraform state for our infrastructure. It must be globally unique so we will use the domain name in the bucket name.

## Create the backend resources for Terraform

This will **NOT** create any instances, it will only create the DynamoDB table and S3 bucket for storing the Terraform backend.

Create the `terraform.tfvars` file using the `terraform.tfvars.template` with the appropriate values:

```bash
cd stalwart-mail-wgproxy/terraform
cp terraform.tfvars.template terraform.tfvars
```

## Populate the `terraform.tfvars` file

Update the `terraform.tfvars` file with the parameters determined above and the contents of the privatekey and publickey files.

```tfvars title="terraform.tfvars"
# DO NOT COMMIT THIS FILE
instance_ami = <AMI FROM PRIOR STEP>
instance_type = <t2.micro or t4g.nano recommended>
region = <AWS_REGION such as us-west-2>
s3_bucket_name = stalwart-wgproxy-<DOMAIN>
wireguard_client_public_key = "<WIREGUARD CLIENT PUBLIC KEY>"
wireguard_server_private_key = "<WIREGUARD SERVER PRIVATE KEY>"
```

```txt title="Example terraform.tfvars"
# DO NOT COMMIT THIS FILE
instance_ami = ami-0b6d6dacf350ebc82
instance_type = t2.micro
region = us-west-2
s3_bucket_name = stalwart-wgproxy-example.com
wireguard_client_public_key = "sA7z7uDwZHh9PPZQ21qNoZLtfnMWCoFm4H/sI92OUy0="
wireguard_server_private_key = "eFl4iI/aEOC0jl32ljrSoEyS5NXmq3QQgfXWpGuAUM="
```

From the projects Terraform directory execute: `terraform init` followed by a targeted `terraform apply`

```bash
terraform init
terraform apply -target=module.s3_dynamodb
```

you can verify that it is only created the S3 bucket w/ policy and DynamoDB table.  The output should look something like:

```txt title="Example run"
terraform init
Initializing the backend...
Initializing modules...
- ec2 in modules/ec2
- s3_dynamodb in modules/s3-dynamodb
- ssm in modules/ssm
- vpc in modules/vpc
Initializing provider plugins...
- Finding latest version of hashicorp/aws...
- Installing hashicorp/aws v5.93.0...
- Installed hashicorp/aws v5.93.0 (signed by HashiCorp)

Terraform has been successfully initialized!
...
--------------------------------------------------------------------------------
terraform apply -target=module.s3_dynamodb
Terraform used the selected providers to generate the following execution plan. Resource actions are indicated with the following
symbols:
  + create

Terraform will perform the following actions:

  # module.s3_dynamodb.aws_dynamodb_table.terraform_locks will be created
  ...
  # module.s3_dynamodb.aws_s3_bucket.terraform_state will be created
  ...
  # module.s3_dynamodb.aws_s3_bucket_versioning.versioning_example will be created
  ...
Plan: 3 to add, 0 to change, 0 to destroy.
Do you want to perform these actions?
  Terraform will perform the actions described above.
  Only 'yes' will be accepted to approve.

  Enter a value: yes
...
module.s3_dynamodb.aws_dynamodb_table.terraform_locks: Creating...
module.s3_dynamodb.aws_s3_bucket.terraform_state: Creating...
module.s3_dynamodb.aws_s3_bucket.terraform_state: Creation complete after 2s [id=stalwart-wgproxy-example.com]
module.s3_dynamodb.aws_s3_bucket_versioning.versioning_example: Creating...
module.s3_dynamodb.aws_s3_bucket_versioning.versioning_example: Creation complete after 2s [id=stalwart-wgproxy-example.com]
module.s3_dynamodb.aws_dynamodb_table.terraform_locks: Creation complete after 7s [id=terraform-state-lock]

|
│ Warning: Applied changes may be incomplete
│
***
We can ignore this warning because we are creating the initial state resources.
This is a one off and we will run all subsequent Terraform non-targeted.
***

Apply complete! Resources: 3 added, 0 changed, 0 destroyed.
```

you can verify that it has only created the S3 bucket w/ policy and DynamoDB table.  The output shows that it created 3 resources.

### Create the backend.tf file

Copy the backend.tf.template file to backend.tf and update it with the bucket name and region.

Example `backend.tf`:

```tf
terraform {
  backend "s3" {
    bucket         = "stalwart-wgproxy-example.com"
    key            = "networking/ec2-wireguard-proxy/terraform.tfstate"
    region         = "us-west-2"
    dynamodb_table = "terraform-state-lock"
    encrypt        = true
  }
}
```

## Migrate local `.tfstate` into new backend

Execute `terraform init` to initialize the remote backend and import the `.tfstate`:

```txt
>terraform init
Initializing the backend...
Do you want to copy existing state to the new backend?
  Pre-existing state was found while migrating the previous "local" backend to the
  newly configured "s3" backend. No existing state was found in the newly
  configured "s3" backend. Do you want to copy this state to the new "s3"
  backend? Enter "yes" to copy and "no" to start with an empty state.

  Enter a value: yes


Successfully configured the backend "s3"! Terraform will automatically
use this backend unless the backend configuration changes.
Initializing modules...
Initializing provider plugins...
- Reusing previous version of hashicorp/aws from the dependency lock file
- Using previously-installed hashicorp/aws v5.91.0

Terraform has been successfully initialized!

You may now begin working with Terraform. Try running "terraform plan" to see
any changes that are required for your infrastructure. All Terraform commands
should now work.

If you ever set or change modules or backend configuration for Terraform,
rerun this command to reinitialize your working directory. If you forget, other
commands will detect it and remind you to do so if necessary.
```
