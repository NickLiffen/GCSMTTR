# GCSMTTR - GitHub Code Scanning Mean Time to Remediate (Data Storage + API)

Welcome to the GCSMTTR Data Storage &amp; API Product! :wave:

## Table of Contents

- [GCSMTTR - GitHub Code Scanning Mean Time to Remediate (Data Storage + API)](#gcsmttr---github-code-scanning-mean-time-to-remediate-data-storage--api)
  - [Table of Contents](#table-of-contents)
  - [Overview](#overview)
  - [How this works](#how-this-works)
  - [Non-Technical Description](#non-technical-description)
  - [Getting Started](#getting-started)
  - [Querying Data (GraphQL)](#querying-data-graphql)
    - [Alert(s) Queries](#alerts-queries)
    - [Repository Overview(s) Queries](#repository-overviews-queries)
    - [Organisation(s) Overview](#organisations-overview)
    - [Technoligies Used](#technoligies-used)
  - [Pre-Req's](#pre-reqs)
  - [Initial Installation](#initial-installation)
    - [Step One: Create IAM User](#step-one-create-iam-user)
    - [Step Two: Create and Configure GitHub App](#step-two-create-and-configure-github-app)
    - [Step Three: Create Parameters within AWS Systems Manager (Parameter Store)](#step-three-create-parameters-within-aws-systems-manager-parameter-store)
    - [Step Four: Deployment into AWS](#step-four-deployment-into-aws)
    - [Step Five: Update GitHub App to send webhooks to the URL output from Step Five](#step-five-update-github-app-to-send-webhooks-to-the-url-output-from-step-five)
  - [FAQ's](#faqs)

## Overview

GCSMTTR Data Storage &amp; API product is an open-source initiative helping teams collect and report mean time to remediate (MTTR) data for GitHub organizations and repositories within their organizations.

## How this works

A high-level design of the solution how this solution works is found below:

<img width="1012" alt="GCSMTTR" src="https://user-images.githubusercontent.com/6696451/138441444-984acdf2-d056-472e-8c25-1a10d76daebd.png">

To explain the diagram above ...

A ' code_scanning_alert ' webhook is triggered whenever a Code Scanning Alert is created/fixed/manually closed; a `code_scanning_alert` webhook is triggered. An Amazon API Gateway then ingests that webhook payload. There are two factors of authentication that occur first.

1. Checking the IP Address of the webhook is a valid GitHub Hook IP.
2. The webhook secret is checked to ensure it matches the secret expected.

If one factor of authentication fails, the webhook is rejected. If both pass, the webhook is accepted, and the payload gets sent to an Amazon EventBridge Queue, which triggers an Amazon Step Function State Machine.

The state machine firstly checks if the `code_scanning_alert` action is either `created` or `fixed/manually closed`. If `created`, the data is structured and entered into the All Events Table. If fixed/manually closed, the data is sent for processing. Suppose the alert is already in the database (i.e. the alert has been created whilst this solution has been enabled). In that case, the data is updated in the database to reflect the new information. If the alert was not already in the database (i.e. the alert never was created before this solution was enabled), the data is not entered into the database and exits.

If data was entered/updated into the All Events Table, a DyanmoDB Event Stream is triggered and sent to a Lambda, which forwards the payload straight onto an Amazon SQS Queue (FIFO). The queue sends the data for processing and updates/creates a record within the Repository Overview Table.

Suppose data was entered/updated into the Repository Overview Table. In that case, a DyanmoDB Event Stream is triggered and sent to a Lambda, which forwards the payload straight onto an Amazon SQS Queue (FIFO). The queue sends the data for processing and updates/creates a record within the Organisation Overview Table.

For a non-technical description, see below.

## Non-Technical Description

This solution allows users to query mean time to remediate data about a GitHub Organisation or a GitHub Repository. Data is stored within three formats:

- **All Events**: This is the raw data that is collected from GitHub. Each row reflects an individual code scanning alert event. This table has code scanning events from multiple GitHub Repositories and Organisations.
- **Repository Overview**: This is the next level up from the All Events table. Each row reflects an individual GitHub Repository. This table shows the total mean time to remediate (MTTR) for a specific repository.
- ** Organization Overview**: This is the next level up from the Repository Overview table. Each row reflects an individual GitHub Organisation. This table shows the total mean time to remediate (MTTR) for a specific organization.

This allows for total flexibility when querying for data across different formats.

## Getting Started

This is a solution which you need to deploy yourself. Due to this solution ingesting and processing webhook data, a custom deployed solution is required. Specifically, you will need to deploy this into an AWS\* environment. The good news is there is an Infrastructure as Code (IaC) file that deploys the whole solution for you, meaning it's a one-click deployment. The guide on deploying this to AWS can be found [below](#initial-installation).

\*This solution right now is specific to AWS. However, the IaC file could be copied and edited to work with Azure/GCP. I would love contributions to this.

## Querying Data (GraphQL)

This service exposes data via a GraphQL API. See the `schema.graphql` to understand how you can get data from this service. The below shows some example queries which can be run to get data out of this service.

### Alert(s) Queries

> A GraphQL Query that returns ALL alerts stored in the All Alerts Table

```graphql
query GetAllAlerts($nextToken: String) {
  getAlerts(nextToken: $nextToken) {
    data {
      alertID
      organisationName
      repositoryName
    }
    nextToken
  }
}
```

> A GraphQL Query that returns data about a single alert stored in the All Alerts Table. The format of the `id` is `org/repo/alertID`

```graphql
query GetSpecificAlertDetail($id: ID) {
  getAlert(id: $id) {
    id
    alertCreatedAtDate
    alertCreatedAtFullTimestamp
    alertCreatedAtMonth
    alertCreatedAtYear
    alertID
    alertURL
    organisationName
    repositoryName
  }
}
```

### Repository Overview(s) Queries

> A GraphQL Query that returns ALL repository overviews stored in the All Repository Overview Table.

```graphql
query GetAllRepositoryOverviews($nextToken: String) {
  getRepositoryOverviews(nextToken: $nextToken) {
    data {
      openAlerts
      numberFixed
      numberManuallyCosed
      repositoryName
      totalTimeToRemediate
      meanTimeToRemediate
    }
    nextToken
  }
}
```

> A GraphQL Query that returns data about a single repository stored in the Repository Overview Table. The format of the `repositoryName` is `org/repo`

```graphql
query GetOverviewDataAboutASpecificRepository($repositoryName: String!) {
  repositoryOverviewbyRepositoryName(repositoryName: $repositoryName) {
    data {
      openAlerts
      numberFixed
      numberManuallyCosed
      repositoryName
      totalTimeToRemediate
      meanTimeToRemediate
    }
    nextToken
  }
}
```

> A GraphQL Query that returns data about a monthlyPeriod stored in the Repository Overview Table. The format of the `monthlyPeriod` is `yyyy-MONTH`

```graphql
query GetOverviewDataFromASpecificMonth($monthlyPeriod: String!) {
  repositoryOverviewbyMonthlyPeriod(monthlyPeriod: $monthlyPeriod) {
    data {
      openAlerts
      numberFixed
      numberManuallyCosed
      monthlyPeriod
      totalTimeToRemediate
      meanTimeToRemediate
    }
    nextToken
  }
}
```

### Organisation(s) Overview

> A GraphQL Query that returns ALL organization overviews stored in the All Organisation Overview Table.

```graphql
query GetOrganisationOverviews($nextToken: String) {
  getOrganisationOverviews(nextToken: $nextToken) {
    data {
      openAlerts
      numberFixed
      numberManuallyCosed
      organisationName
      totalTimeToRemediate
      meanTimeToRemediate
    }
    nextToken
  }
}
```

> A GraphQL Query that returns data about a single organization stored in the Organisation Overview Table. The format of the `organisationName` is `org`.

```graphql
query GetOverviewDataAboutASpecificOrganisation($organisationName: String) {
  organisationOverviewbyOrganisationName(organisationName: $organisationName) {
    data {
      openAlerts
      numberFixed
      numberManuallyCosed
      OrganisationName
      totalTimeToRemediate
      meanTimeToRemediate
    }
    nextToken
  }
}
```

> A GraphQL Query that returns data about a monthlyPeriod stored in the Organisation Overview Table. The format of the `monthlyPeriod` is `yyyy-mm`

```graphql
query GetOverviewDataFromASpecificMonth($monthlyPeriod: String) {
  organisationOverviewbyMonthlyPeriod(monthlyPeriod: $monthlyPeriod) {
    data {
      openAlerts
      numberFixed
      numberManuallyCosed
      monthlyPeriod
      totalTimeToRemediate
      meanTimeToRemediate
    }
    nextToken
  }
}
```

These are only example queries and can be adjusted, added to or removed to fit whatever requirements are in line with the `schema.graphql`.

### Technoligies Used

The following technologies are used throughout this solution:

- AWS
  - [Lambda](https://aws.amazon.com/lambda/) is used for compute power.
  - [Cloud Formation](https://aws.amazon.com/cloudformation/) is used as our IaC (Infrastructure as Code).
  - [HTTP API Gateway](https://aws.amazon.com/api-gateway/) is used for ingress into AWS.
  - [Cloud Watch](https://aws.amazon.com/cloudwatch/) is used for logging and monitoring.
  - [IAM](https://aws.amazon.com/iam/) is used to connect resources and allow deployments into AWS from GitHub Actions
  - [S3](https://aws.amazon.com/s3/) is used by AWS SAM to deploy the stack, and therefore deploy it into the AWS ecosystem using Cloud Formation.
  - [AWS Systems Manager Parameter Store](https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-parameter-store.html) is used to store parameters.
  - [AWS Step Functions](https://aws.amazon.com/step-functions/) is used to co-ordinate the end-to-end process
  - [AWS DynamoDB](https://aws.amazon.com/dynamodb/) is used to store data.
  - [AWS SQS](https://aws.amazon.com/sqs/) is used to queue data.
  - [AWS AppSync](https://aws.amazon.com/app-sync/) is used to create the GraphQL API
- GitHub
  - [GitHub App](https://docs.github.com/en/developers/apps/building-github-apps) is used as our egress method out of GitHub.
  - [GitHub Actions](https://docs.github.com/en/developers/apps/building-github-apps) is used to deploy the solution into AWS.

[AWS SAM](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/what-is-sam.html) is used for the lambda &amp; HTTP API Gateway resources.

**Note**: Even though this solution is deployed to AWS, the code can be changed to work with the likes of Azure and GCP (Azure Function, Google Functions, etc.).

## Pre-Req's

1. Access to a cloud environment (AWS would be the quickest to get started)
2. Access to a GitHub environment.
3. A repository where the code for this solution is going to live.

## Initial Installation

The below steps show the _path of least resistance_ way of deploying this solution into AWS. There are **many** different ways to deploy this. Every organization likely has different processes (especially with deploying into AWS), meaning you may have to pivot during these steps to accommodate organization-specific processes. This is okay. Please treat these instructions as an example and reference; if they work end-to-end, great; if not, please adjust to your company policies (and if needed, contribute back!).

If you get an error you cannot get around; please log an issue on this repository.

### Step One: Create IAM User

Create an [IAM User](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_users_create.html). The IAM User will need to have the capability to do the following:

- CRUD access over S3, IAM, API Gateway, Lambda, Cloudwatch, Step Functions, App Sync, DynamoDB and SQS Resources.

From that user, create an AWS Access key and secret. Once you have both, make a [GitHub Enviroment](https://docs.github.com/en/actions/reference/environments#creating-an-environment) called **main** and within that environment create two secrets `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` with the relevant information from AWS in. Set the environment to only deploy from the `main` branch. (This can be changed later at any time).

**NOTE**: If your organization doesn't allow the use of IAM Users, this isn't a problem. We use the official [configure-aws-credentials](https://github.com/aws-actions/configure-aws-credentials) GitHub action. Meaning you can head to the `.github/workflows/deploy.yaml` file and swap out the AWS User method to assuming an AWS Role. Or, if you have a custom GitHub Action which authenticates into AWS, remove the `configure-AWS-credentials` action and swap it out for your custom one.

### Step Two: Create and Configure GitHub App

Create a [GitHub Application](https://docs.github.com/en/developers/apps/building-github-apps/creating-a-github-app). You will need to be an administrator of your GitHub organization to do this. During the creation of the application, you only need to enter:

1. GitHub App Name: GCSMTTR - GitHub Code Scanning Mean Time To Remediate
2. Homepage URL: https://donotknowthisurlyet.com
3. Webhook URL: https://donotknowthisurlyet.com
4. Webhook Secret: _enter secret of your choice - keep this value secret but note it down for later_
5. Permissions:
   - Code Scanning Alerts
6. Subscribe to events:
   - Code Scanning Alerts
7. Where can this integration be installed: Only on this account

The rest of the fields you do not need to enter. Right now, you don't know what the URL's are going to be, so put any value in there.

Once the application is created, you need to install the GitHub App on your organization and then add the repositories you would like code scanning alerts to be processed. Follow the instructions here: [Installing your private GitHub App on your repository](https://docs.github.com/en/developers/apps/managing-github-apps/installing-github-apps#installing-your-private-github-app-on-your-repository).

**NOTE**: When you install the GitHub App on your GitHub Organisation, I would advise you do not have it connected to **every** repository to start with. To get familiar with the process, only install on a few repositories and once comfortable, you can install across the organization if you like.

Once it's installed, we need to collect some information:

1. GitHub App Private Key. Follow the instructions here: [Generating a private key](https://docs.github.com/en/developers/apps/building-github-apps/authenticating-with-github-apps#generating-a-private-key) to do that.
2. Client Secret: Just above where you generated the private key, there will be an option for you to generate a client secret. Click the _Generate a new Client Secret_ button and note down the secret.
3. Client ID: Just above where you generated the client secret, you will see the Client ID; take a note of the id.
4. App ID: Just above where you generated the client secret, you will see the App ID; take a note of the id.
5. Installation ID: The Installation ID is in a different location; head to your Organizations GitHub App's page (https://github.com/organizations/${orgName}/settings/installations). Click _Configure_ next to the GitHub App you created. If you look at the URL, at the end of the URL, you will see a number. It should be after the `installations/` part of the URL. Copy down that number.

### Step Three: Create Parameters within AWS Systems Manager (Parameter Store)

Log into AWS, head to AWS Systems Manager, then AWS Parameter Store. In total, you will need to create seven parameters.

1. `/GCSMTTR/APP_CLIENT_ID`: The GitHub App Client ID you got from Step Three.
2. `/GCSMTTR/APP_CLIENT_SECRET`: The GitHub App Client Secret you got from Step Three.
3. `/GCSMTTR/APP_ID`: The GitHub App ID you got from Step Three.
4. `/GCSMTTR/APP_INSTALLATION_ID`: The GitHub App Installation ID you got from Step Three.
5. `/GCSMTTR/APP_PRIVATE_KEY`: The GitHub App Private Key you got from Step Three. (The first part when you created the GitHub App)
6. `/GCSMTTR/GITHUB_WEBHOOKS_SECRET`: The secret you assigned to the webhook.

**NOTE**: It is recommended you make the: `/GCSMTTR/APP_CLIENT_SECRET`, `/GCSMTTR/APP_PRIVATE_KEY`, `/GCSMTTR/GITHUB_WEBHOOKS_SECRET` values `SecureString` within Parameter Store. The rest can be `String` types.

### Step Four: Deployment into AWS

Second to last step! Before we do this, let's check a few things:

- An environment is created with two GitHub Secrets in which can deploy the solution to AWS.
- A GitHub app is created, connected to the repositories where you would like to auto remediate secrets of a certain type
- AWS Parameters have been created.

If the above is complete, pull the contents of this codebase and push it into the repository where you configured the GitHub Environment and Secrets. Make sure you push to the main branch (or the branch you configured in the environment to deploy from).

GitHub Actions should now trigger! You can watch the workflow within the Actions tab of your repository, but what it is doing is:

- Linting
- Building (Typescript -> Javascript)
- Building (SAM)
- Deploying (SAM)

The first time you deploy, it should take about 5-6 minutes. As long as the role you created in Step One has the correct permissions mentioned above, your deployment should succeed. Log into AWS, head to Cloud Formation, look for the `GCSMTTR` stack, head to outputs, and you should see an output called: `HttpApiUrl`. Note down this URL.

### Step Five: Update GitHub App to send webhooks to the URL output from Step Five

Head back to the GitHub App you created in Step Four. Head down to the Webhook URL, enter the URL from Step Five and add `/GCSMTTR` onto the end of the URI. The URL you got from the output is the domain, but not the full URI where webhooks should be sent. So make sure to put the `/GCSMTTR` endpoint onto that URL.

Click _Save_

Done! From now on, whenever a Code Scanning Alert gets: `created`, `fixed` and `closed_by_user`, an event will be fired to be processed.

## FAQ's

**Why use an SQS Queue? Why doesn't the DynamoDB Stream invoke the lambda, which enters data into the Repo + Org Overview Table(s)?**.

The reason why SQS is used is to maintain a single record at a time processing. The lambda function, which creates/updates rows within the Repository Overview table, needs to maintain a consistent read on the DynamoDB row it could be updating. 1,000+ Code Scanning alerts could fire simultaneously, which means 1,000+ rows could be entered into the All Events Table. The SQS queue makes sure that only one record is processed at a time. Without this, all 1,000+ code scanning alerts would fire 1,000+ DynamoDB stream events, then fire up multiple lambdas and read data simultaneously. This means the data entered into the DynamoDB Table gets entered incorrectly, as data has been misread. We need to maintain FIFO and single row processing to maintain data consistency. The SQS queue helps maintain this. The same goes for the Organisation Overview table. As both Org + Repo Overview tables get updated, single row processing is critical.

**Why doesn't the API Gateway Invoke the State machine directly after both authorizers have passed. Why is Event Bridge needed?**.

_sigh_. You can't get the body of the payload within a lambda authorizer. This means that the secret validation can't be within a dedicated lambda authorizer; it must be within a standard lambda. This is painful, agreed, and adds about a second onto processing time. Something I will look to try and find a better way around. However, it works, and the most important thing is there are two factors of authentication.

**UMMM, there is no authentication directly on the API; why?!**

This again is a great question. TLDR, there is authentication, but it's the step past the API. Why? There are a few reasons. The main one is scale. If you have three repos with 4,000 alerts each, and if they are to trigger within a second, this will send 12,000 webhooks within a second. If you have a Lambda authorizer that validates the IP address of the incoming webhook, that lambda would need to call AWS SSM or Secret Manager to get credentials to hit the GitHub Meta API. Firstly, you can't make 12,000 requests a second to the GitHub API, and secondly, AWS SSM or Secret Manager don't allow that number either. So, to get around this, we send data straight from AWS API to an SQS Queue for processing. This way, we can send data one at a time and ensure no rate limits are hit. We are still doing two authentication factors, but auth is done on the first lambda process instead of directly on the API.

**I do not see data consistency between GitHub and my MTTR Tables; why?!**

There are a few (legitimate) reasons why this could be the case:

- This solution only works for alerts that have been created/fixed/closed after this solution has been deployed. For example, if you already had ten alerts on your repository before this solution was deployed, ten alerts would not be processed. So if you had ten before and then six after this solution is deployed, then it would track the six in the database.
- This solution does not handle **deletes** of code scanning alerts. EG, if you delete a code scanning alert, the database would not be notified and, therefore, not updated.
