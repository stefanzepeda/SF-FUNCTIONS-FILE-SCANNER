# PDF Scanner with Salesforce Functions

We can't control what our users attach to our Salesforce environment as we strive to keep an open collaboration environment, we should also strive for maximum security. This project explores an option of redacting PII information from PDFs using Salesforce serverless technology known as Salesforce Functions.

## Set up your environment

To deploy this project you will need a Salesforce DevHub with Functions enabled. You can get this by purchasing Salesforce Functions or requesting a trial from your account executive.

## Configure Your Salesforce DX Project

Clone this Github Repository locally and use Visual Studio Code

## Start up functions
High level steps are:

1. Login to the functions runtime
2. Create a compute environment
3. Deploy the function code to the compute environment
4. Open the default org and navigate to the Files tab
5. Attach a PDF file with PII information
6. Wait a few seconds and verify that the file has been overriden by the function.

