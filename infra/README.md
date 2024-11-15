# Masabra: Mariana's GCP Infraestructure.

## Introduction

This repository contains the Terraform configurations for deploying the backend services for Mariana's remote versioning capabilities. [Gitea](https://gitea.io/en-us/) is used as a lightweight, self-hosted Git service.


## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Prerequisites](#prerequisites)
- [Setup Instructions](#setup-instructions)
  - [1. Configure Variables](#1-configure-variables)
  - [2. Initialize Terraform](#3-initialize-terraform)
  - [3. Apply Terraform Configuration](#4-apply-terraform-configuration)
- [Accessing Gitea](#accessing-gitea)
- [Destroying the Infrastructure](#destroying-the-infrastructure)
- [Troubleshooting](#troubleshooting)
- [Setting Up the gcloud SDK](#setting-up-the-gcloud-sdk)


## Architecture Overview

![GCP-Cloud-Infraestructure](const/masabra.drawio.png)

The Terraform scripts provision the following resources on GCP:

- **Compute Engine Instance**: Virtual machine running Gitea.
- **VPC Network**: Virtual Private Cloud network for the instance.
- **Load Balancer**: Basic load balancing components, including a health check, backend service, URL map, HTTP proxy, and forwarding rule.
- **Firewall Rules**: Allow HTTP (port 80, 443) and SSH (port 22) access.
- **External IP Address**: Public IP to access Gitea over the internet.
- **Disk Storage**: Persistent disk for data storage.

## Prerequisites

Before starting, ensure you have:

- A GCP account with project-level access.
- [`terraform >= 1.9.8`](https://www.terraform.io/downloads.html).
- [`gcloud >= 497.0.0`](https://cloud.google.com/sdk/docs/install) installed and configured.

## Setup Instructions

### 1. Configure Variables

Edit the `variables.tf` file or create a `terraform.tfvars` file to customize the deployment. Key variables include:

- **Project Settings**:
  - `project_id`: Your GCP project ID.
  - `region`: GCP region for resource deployment.
  - `zone`: GCP zone within the region.

- **Instance Settings**:
  - `machine_type`: Compute Engine instance type (e.g., `e2-medium`).
  - `instance_name`: Name of the Gitea VM instance.

- **Network Settings**:
  - `network_name`: Name of the VPC network.
  - `subnet_name`: Name of the subnet.

- **Gitea Settings**:
  - `gitea_port`: Port on which Gitea will run (default is `3000`).
  - `gitea_admin_username`: Admin username for Gitea.
  - `gitea_admin_password`: Admin password for Gitea.
  - `gitea_db_password`: DB password for the PostgreSQL DB that gitea will use.

**Example `terraform.tfvars` file:**

```hcl
project_id           = "your-gcp-project-id"
region               = "us-central1"
zone                 = "us-central1-a"
machine_type         = "e2-medium"
instance_name        = "gitea-instance"
network_name         = "gitea-network"
subnet_name          = "gitea-subnet"
gitea_port           = 3000
gitea_admin_username = "admin"
gitea_admin_password = "strongpassword"
gitea_db_password    = "your-secure-password"
```

### 3. Initialize Terraform

Initialize the Terraform working directory to download necessary providers and modules.

```bash
terraform init
```

### 4. Apply Terraform Configuration

Review and apply the Terraform plan to create resources.

```bash
terraform plan
terraform apply
```

Type `yes` when prompted to confirm the operation.

## Accessing Gitea

1. **Retrieve the External IP Address**:

   ```bash
   terraform output gitea_instance_ip
   ```

2. **Access Gitea Web Interface**:

   Open your web browser and navigate to `http://<GITEA_IP_ADDRESS>:80` / `http://<GITEA_IP_ADDRESS>`.

3. **Log In**:

   Use the admin credentials specified in your `terraform.tfvars` file.

## Destroying the Infrastructure

To remove all resources created by Terraform:

```bash
terraform destroy
```

Confirm by typing `yes` when prompted.

## Troubleshooting

- **SSH Access to VM**:

  ```bash
  gcloud compute ssh <instance_name> --project=<project_id> --zone=<zone>
  ```

- **Firewall Issues**:

  Ensure firewall rules allow inbound traffic on ports `80` (HTTP/S) and `22` (SSH).

- **Terraform Errors**:

  - Make sure all required variables are set.
  - Check for typos or incorrect values in your `terraform.tfvars` file. _(MIHTT: Man I Hate Terraforms Tfvars)_
  - If you mess with the `tfstate` you get the lead. _((threat))_
  - Make sure the GCP Compute api is turned on `compute.googleapis.com`.

## Setting Up the gcloud SDK

To interact with GCP resources, and depliy the infraestructure, ensure the Google Cloud SDK is installed and properly configured:

1. **Install the gcloud SDK**:
   - Download and install the SDK from the [official Google Cloud SDK documentation](https://cloud.google.com/sdk/docs/install).

2. **Authenticate with the Google Account**:
   Run the following command and follow the prompts to log in:

   ```bash
   gcloud auth application-default login
   ```

3. **Set the active project**:
   There are two ways to configure the project ID for your GCP project:
  
   1. Set up the project with the sdk helper:
      ```bash
      gcloud init
      ```

   2. Manually set up the project:
      ```bash
      gcloud config set project <your-project-id>
      ```
      It should be the same as the `project_id` environment variable.

    **Either one should work.**

4. **Verify your setup**:
   Check if your gcloud CLI is properly configured by listing active configurations:

   ```bash
   gcloud config list
   ```

   You should see your project, region, and zone correctly set.

5. **Enable required APIs**:
   > _**This step should not be done unless a new project is run, the API should already be initialized**_. 
   
   Ensure the necessary APIs are enabled for your project:

   ```bash
   gcloud services enable compute.googleapis.com
   ```

6. **Test your connection**:
   Try listing your active compute instances to ensure everything is set up:

   ```bash
   gcloud compute instances list
   ```

   If your instance is listed, the SDK is ready for use.
