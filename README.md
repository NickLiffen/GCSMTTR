# GCSMTTR - GitHub Code Scanning Mean Time to Remedaite (Data Storage + API)

## Overview

This solution allows enterprises to collect mean time to remedaite (MTTR) data on GitHub Organisations and Repositories; as well as presenting MTTR data via a GraphQL API.

## Non-Technical Description

This solution allows users to query mean time to remedaite data about a GitHub Organisation, a GitHub Repository. Data is stored within three formats:

- **All Events**: This is the raw data that is collected from GitHub. Each row reflects an individual code scanning event. This table has code scanning events from multiple GitHub Repositories and Organisations.
- **Repository Overview**: This is the next level up from the All Events table. Each row reflects an individual GitHub Repository. This table shows the total mean time to remedaite (MTTR) for a specific repository.
- **Organisation Overview**: This is the next level up from the Repository Overview table. Each row reflects an individual GitHub Organisation. This table shows the total mean time to remedaite (MTTR) for a specific organisation.

This allows for total flexibility when querying for data across different formats.

## How to get started

This is a solution which you need to deploy yourself. Due to this solution ingesting and processing webhooks, a custom-built solution is required. Specifically, you will need to deploy this into an AWS\* enviroment. Good news is there is an Infroastrucre as Code (IaC) file that deploys the whole solution for you; meaning it's a on click deployment. The guide on deplpying this to AWS can be found below.

\*This solution right now is specific to AWS, however the IaC file could be copied and edited to work with Azure/GCP. I would love contributions on this.

## Architecture

This is a event driven architecture. It makes use of Amazon Web Services (AWS) as it's primary hosting solution.

![GCSMTTR](https://lucid.app/publicSegments/view/d84edc5b-5da1-4b82-b0f7-ab0ccac4b78b/image.png)

## Technical Description

Whenever a Code Scanning Alert is created/fixed/manually closed, a `code_scanning_alert` webhook is triggered. That webhook payload is then ingested by an Amazon API Gateway. There are two factors of authentication on the gateway. 1) Checking the IP Address of the webhook is a valid GitHub Hook IP. 2) The webhook secret is checked to ensure it matches the secret expected. If one factor of authentication failes, the webhook is rejected. If both passes, thr webhook is accepted and the payload gets sent to an Amazon EventBridge Queue which triggered an Amazon Step Function State Machine. The state machine firstly checks if the `code_scanning_alert` action is either created OR fixed/manually closed. If created, the data is processed and entered into the All Events Table. If fixed/manually closed, the data is processed and if the alert is already in the database (i.e. the alert has been created before and stored), the data is updated in the database to reflect the new information. If the alert is not already in the database (i.e. the alert never was created before and stored), the data is not entered into the databse and exits.

If data was entered/updated into the All Events Table, a DyanmoDB Event Stream is triggered and sent to a Lambda, which then forwards the payload straight onto an Amazon SQS Queue (FIFO). The queue sends the data for processing and updates/creates a record within the Repository Overview Table.

If data was entered/updated into the Repository Overview Table, a DyanmoDB Event Stream is triggered and sent to a Lambda, which then forwards the payload straight onto an Amazon SQS Queue (FIFO). The queue sends the data for processing and updates/creates a record within the Organisation Overview Table.

If you are wondering about any technical design decisions, please see the section below.

## Technical Decisions

**Why use an SQS Queue? Why doesn't the DynamoDB Stream invoke the lambda which enteres data into the Repo + Org Overview Table(s)?**.

The reason why SQS is used is to maintain single record at a time processing. The lambda function which creates/updates rows within the Repository Overview table needs to maintain a consistent read on the DynamoDB row it could be updating. 1,000+ Code Scanning alerts could fire at the same time, and this means 1,000+ rows could be entered into the All Events Table. The SQS queue makes sure that only one record is processed at a time. Without this, all 1,000+ code scannig alerts would fire 1,000+ dynamodb strteam events, which would then fire up multiple lambdas, and read data at the same time. This means the data that is being entered into the DynamoDB Table gets entered incorrectly, as data has been read incorrectly. We need to maintain FIFO and single row processing to maintain data consistnecy. The SQS queue helps maintain this. The same goes for the Organisation Overview table. As both Org + Repo Overview tables get updated, single row processing is critical.

**Why doesn't the API Gateway Invoke the State machine directly after both authroizers have passed. Why is Event Bridge needed?**.

_sigh_. You can't get the body of the payload within a lambda authorizer. This means that the secret validation can't be within a dedicated lambda authorizer, it needs to be within a standard lambda. This is painful, agreed, and adds about a second onto processing time. Something I will look to try and find a better way around. However, it works and the most important thing is there are two factors of authentication.

## GraphQL Quries

This service exposes data via a GraphQL API. The below shows examples of quries you can run to get data out of this service. For an extensive list, please see the `schema.graphql` and

```graphql
query MyQuery {
  getAlert(id: "orgName/repoName/22") {
    alertID
    organisationName
    repositoryName
  }
}
```
