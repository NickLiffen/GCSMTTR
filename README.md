# GCSMTTR - GitHub Code Scanning Mean Time to Remedaite (Data Storage + API)

Welcome to the GCSMTTR Data Storage &amp; API Product! :wave:

## Table of Contents

- [Overview](#overview)
- [How this works](##how-this-works)
  - [Non-Technical](#non-technical)
- [Design](#design)
  - [Design Overview](#design-overview)
  - [Technoligies Used](#technoligies-used)
- [Pre-Reqs](#pre-reqs)
- [Initial Installation](#initial-installation)
  - [Step One: Create IAM User](#step-one-create-iam-user)
  - [Step Two: Create and Configure GitHub App](#step-two-create-and-configure-github-app)
  - [Step Three: Create Parameters within AWS Systems Manager (Parameter Store)](#step-three-create-parameters-within-aws-systems-manager-parameter-store)
  - [Step Four: Deployment into AWS](#step-four-deployment-into-aws)
  - [Step Five: Update GitHub App to send webhooks to the URL output from Step Five](#step-five-update-github-app-to-send-webhooks-to-the-url-output-from-step-five)
- [Configuring Remediators](#configuring-remediators)
- [Issues and Feedback](#issues-and-feedback)
- [Contributing](#contributing)
- [FAQs](#faqs)

## Overview

The GCSMTTR Data Storage &amp; API Product solution allows enterprises to collect and report mean time to remedaite (MTTR) data for GitHub organisations, and repositories within them organisations.

## How this works

A high level design of this solution how this solution works is found below:

<img width="1012" alt="GCSMTTR" src="https://user-images.githubusercontent.com/6696451/138441444-984acdf2-d056-472e-8c25-1a10d76daebd.png">

To explain the diagram above ...

Whenever a Code Scanning Alert is created/fixed/manually closed, a `code_scanning_alert` webhook is triggered. That webhook payload is then ingested by an Amazon API Gateway. There are two factors of authentication that occur first.

1. Checking the IP Address of the webhook is a valid GitHub Hook IP.
2. The webhook secret is checked to ensure it matches the secret expected.

If one factor of authentication failes, the webhook is rejected. If both pass, the webhook is accepted and the payload gets sent to an Amazon EventBridge Queue which triggers an Amazon Step Function State Machine.

The state machine firstly checks if the `code_scanning_alert` action is either `created` or `fixed/manually closed`. If `created`, the data is structured and entered into the All Events Table. If fixed/manually closed, the data is sent for processing. If the alert is already in the database (i.e. the alert has been created whilst this solution has been enabled), the data is updated in the database to reflect the new information. If the alert was not already in the database (i.e. the alert never was created before this solution was enabled), the data is not entered into the databse and exits.

If data was entered/updated into the All Events Table, a DyanmoDB Event Stream is triggered and sent to a Lambda, which then forwards the payload straight onto an Amazon SQS Queue (FIFO). The queue sends the data for processing and updates/creates a record within the Repository Overview Table.

If data was entered/updated into the Repository Overview Table, a DyanmoDB Event Stream is triggered and sent to a Lambda, which then forwards the payload straight onto an Amazon SQS Queue (FIFO). The queue sends the data for processing and updates/creates a record within the Organisation Overview Table.

For a non-technical description, see below.

## Non-Technical Description

This solution allows users to query mean time to remedaite data about a GitHub Organisation or a GitHub Repository. Data is stored within three formats:

- **All Events**: This is the raw data that is collected from GitHub. Each row reflects an individual code scanning alert event. This table has code scanning events from multiple GitHub Repositories and Organisations.
- **Repository Overview**: This is the next level up from the All Events table. Each row reflects an individual GitHub Repository. This table shows the total mean time to remedaite (MTTR) for a specific repository.
- **Organisation Overview**: This is the next level up from the Repository Overview table. Each row reflects an individual GitHub Organisation. This table shows the total mean time to remedaite (MTTR) for a specific organisation.

This allows for total flexibility when querying for data across different formats.

## Getting Started

This is a solution which you need to deploy yourself. Due to this solution ingesting and processing webhook data, a custom deployed solution is required. Specifically, you will need to deploy this into an AWS\* enviroment. Good news is there is an Infroastrucre as Code (IaC) file that deploys the whole solution for you; meaning it's a on click deployment. The guide on deplpying this to AWS can be found below.

\*This solution right now is specific to AWS, however the IaC file could be copied and edited to work with Azure/GCP. I would love contributions on this.

## GraphQL Quries

This service exposes data via a GraphQL API. See the `schema.graphql` to understand how you can get data from this service. The below shows some example quries which can ran to get data out of this service.

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

```graphql
query GetSpecificAlertDetail($id: String) {
  getAlert(id: $id) {
    alertID
    organisationName
    repositoryName
  }
}
```

```graphql
query GetOverviewDataAboutASpecificRepository($repositoryName: String) {
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

These are only example quries and can be adjusted, added to or removed to fit whatever requirments are inline with the `schema.graphql`.

## FAQ's

**Why use an SQS Queue? Why doesn't the DynamoDB Stream invoke the lambda which enteres data into the Repo + Org Overview Table(s)?**.

The reason why SQS is used is to maintain single record at a time processing. The lambda function which creates/updates rows within the Repository Overview table needs to maintain a consistent read on the DynamoDB row it could be updating. 1,000+ Code Scanning alerts could fire at the same time, and this means 1,000+ rows could be entered into the All Events Table. The SQS queue makes sure that only one record is processed at a time. Without this, all 1,000+ code scannig alerts would fire 1,000+ dynamodb strteam events, which would then fire up multiple lambdas, and read data at the same time. This means the data that is being entered into the DynamoDB Table gets entered incorrectly, as data has been read incorrectly. We need to maintain FIFO and single row processing to maintain data consistnecy. The SQS queue helps maintain this. The same goes for the Organisation Overview table. As both Org + Repo Overview tables get updated, single row processing is critical.

**Why doesn't the API Gateway Invoke the State machine directly after both authroizers have passed. Why is Event Bridge needed?**.

_sigh_. You can't get the body of the payload within a lambda authorizer. This means that the secret validation can't be within a dedicated lambda authorizer, it needs to be within a standard lambda. This is painful, agreed, and adds about a second onto processing time. Something I will look to try and find a better way around. However, it works and the most important thing is there are two factors of authentication.

**UMMM, there is no authentication directly on the API, why?!**

This again, is a great question. TLDR, there is authentication, but it's the step past the API. Why? There are a few reasons. The main one being scale. If you have three repos with 4,000 alerts each, and if they are to trigger within a second, this would send 12,000 webhooks within a second. If you have a Lambda authorizer, that validates the IP address of the incoming webhook; that lambda would need to call AWS SSM or Secret Manager to get credentials to hit the GitHub Meta API. Firstly, you can't make 12,000 requests a second to the GitHub API and secondly, AWS SSM or Secret Manager don't allow that number either. So, to get around this, we send data straight from AWS API to an SQS Queue for processing. This way we can send data one at a time, and ensure no rate limits are hit. We are still doing two factors of authentication, but instead of directly on the API, auth is done on the first lambda process.
