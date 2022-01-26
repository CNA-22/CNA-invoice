'use strict';

const axios = require('axios');

const createPDF = (invoiceData) => {
  console.log(invoiceData)
}

module.exports.createInvoice = async (event) => {

  // form data
  // pdf = createPDF()
  // axios post pdf => email service

  const request = JSON.parse(event.body)
  const orderId = request.order_id
  const customerId = request.customer_id
  const address = request.address
  const date = request.date
  
  if(orderId != '' && customerId != '' && address != '' && date != ''){
    createPDF(orderId, customerId, address, date)
  
  
  }

  
  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: `EVENT ${event.body}`,
        input: event,
      },
      null,
      2
    ),
  };

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // return { message: 'Go Serverless v1.0! Your function executed successfully!', event };
};
