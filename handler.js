'use strict';

//const AWS = require('aws-sdk')
const axios = require('axios')
const { createPDF } = require('./utils')

//const S3 = AWS.S3()
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
  // need to call other apis for data?
  

  const invoicePdf = await createPDF(orderId, customerId, address, date)
  //conevrt base64 to pdf
  //upload invoicepdf to s3 bucket
  //send url to email api
  console.log('res', invoicePdf)
  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: `Invoice sent`,
        input: invoicePdf,
      },
      null,
      2
    ),
  };

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // return { message: 'Go Serverless v1.0! Your function executed successfully!', event };
};
