'use strict';

const AWS = require('aws-sdk')
const axios = require('axios')
const { createPDF } = require('./utils')

const S3 = new AWS.S3()

const BUCKET = process.env.BUCKET_NAME

module.exports.createInvoice = async (event) => {

  const request = JSON.parse(event.body)
  const orderId = request.order_id
  const customerId = request.customer_id
  const address = request.address
  const date = request.date
  
  if(typeof orderId != 'string' || typeof customerId != 'string' || typeof address != 'string' || typeof date != 'string'){
    console.error('Validation Failed');
    callback(new Error('Couldn\'t create invoice because of validation errors.'));
    return;
  }

  const response = {
    isBase64Encoded: false,
    statusCode: 200,
    body: JSON.stringify({ message: "Successfully created invoice" }),
  };
  // need to call other apis for data?
  try {
    const invoiceB64 = await createPDF(orderId, customerId, address, date)
    //b64 decoder
    const invoiceDecoded = Buffer.from(invoiceB64, 'base64')
    const params = {
      Bucket: BUCKET,
      Key: `invoice/${orderId}`,
      Body: invoiceDecoded,
      ContentType: "application/pdf",
    };
    //upload invoicepdf to s3 bucket
    const uploadResult = await S3.upload(params).promise();
    response.body = JSON.stringify({ message: "Successfully uploaded invoice to S3", uploadResult });
    //send url to email api

  } catch (error) {
    console.error(e);
    response.body = JSON.stringify({ message: "Invoice failed to upload", errorMessage: e });
    response.statusCode = 500;
  }

  return response

};
