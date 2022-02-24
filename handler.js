'use strict';

const AWS = require('aws-sdk')
const { createPDF, sendInvoice } = require('./utils')

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
    // params for s3 upload 
    const params = {
      Bucket: BUCKET,
      Key: `invoice/${orderId}`,
      Body: invoiceDecoded,
      ContentType: "application/pdf",
    }
    //upload invoicepdf to s3 bucket
    // use signedUrl putobject instead?
    const uploadResult = await S3.upload(params).promise();
    // params for signedUrl 
    const urlParams = {
      Bucket: BUCKET,
      Key: `invoice/${orderId}`,
      Expires: 3600, // one hour/ maybe change to one day = 86400
    }
    // create signedUrl to be sent to email api
    const signedUrl = S3.getSignedUrl('getObject', urlParams)
    //send url to email api
    const res = await sendInvoice(signedUrl, orderId)
    response.body = JSON.stringify({ message: 'Successfully uploaded invoice to s3 and sent mmail including signed url', res: res})

  } catch (err) {
    console.error(err);
    response.body = JSON.stringify({ message: "Invoice failed to upload", errorMessage: err })
    response.statusCode = 500;
  }

  return response

};
