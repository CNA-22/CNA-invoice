'use strict';

const AWS = require('aws-sdk')
const { createPDF, sendInvoice } = require('./utils')

const S3 = new AWS.S3()

const BUCKET = process.env.BUCKET_NAME
const JWT_TOKEN = process.env.JWT_TOKEN

module.exports.createInvoice = async (event) => {

  const request = JSON.parse(event.body)
  const orderId = request.orderId
  const customerId = request.customerNumber
  const address = request.address
  const date = request.date
  const email = request.email
  const name = request.name
  const itemId = request.itemId
  const token = request.token
  const price = request.price
  // base response
  const response = {
    isBase64Encoded: false,
    statusCode: 200,
    body: JSON.stringify({ message: "Successfully created invoice" }),
  };
  //validation
  if(typeof orderId != 'string' || typeof customerId != 'string' || typeof email != 'string' || typeof name != 'string' || typeof itemId != 'string' ){
    console.error('Validation Failed');
    response.statusCode = 400
    response.body = JSON.stringify({ message: "Request validation failed"})
    return response;
  }
  
  // need to call other apis for data?
  try {
    //utils func, creates pdf
    const invoiceB64 = await createPDF(orderId, customerId, address, date, email, name, itemId, price)
    //b64 decoder
    const invoiceDecoded = Buffer.from(invoiceB64, 'base64')
    // params for s3 upload 
    const params = {
      Bucket: BUCKET,
      Key: `invoice/${customerId}/${orderId}`,
      Body: invoiceDecoded,
      ContentType: "application/pdf",
    }
    //upload invoicepdf to s3 bucket
    const uploadResult = await S3.upload(params).promise();
    // params for signedUrl 
    const urlParams = {
      Bucket: BUCKET,
      Key: `invoice/${customerId}/${orderId}`,
      Expires: 86400, // one day
    }
    // create signedUrl to be sent to email api
    const signedUrl = S3.getSignedUrl('getObject', urlParams)
    //send url to email api
    const res = await sendInvoice(signedUrl, orderId, token, email)
    response.body = JSON.stringify({ message: 'Successfully uploaded invoice to s3', link: signedUrl, res: res})

  } catch (err) {
    console.error(err);
    response.body = JSON.stringify({ message: "Invoice failed to upload", errorMessage: err })
    response.statusCode = 500;
  }

  return response

};
