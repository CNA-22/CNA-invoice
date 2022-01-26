'use strict';

const axios = require('axios');
const easyinvoice = require('easyinvoice');

const createPDF = (orderId, customerId, address, date) => {
    let data = {
      
      "sender": {
          "company": "Sample Corp",
          "address": "Sample Street 123",
          "zip": "1234 AB",
          "city": "Sampletown",
          "country": "Samplecountry"
      },
      // Your recipient
      "client": {
          "company": "Client Corp",
          "address": {address},
          "zip": "4567 CD",
          "city": "Clientcity",
          "country": "Clientcountry"
          
      },
      "information": {
          // Invoice number
          "number": Date(date).getTime() + "-"+customerId,
          // Invoice data
          "date": Date(date),
          // Invoice due date
          "due-date": "31-12-2021"
      },
      "products": [
          {
              "quantity": 2,
              "description": "Product 1",
              "tax-rate": 6,
              "price": 33.87
          },
          {
              "quantity": 4.1,
              "description": "Product 2",
              "tax-rate": 6,
              "price": 12.34
          },
          
      ],
      // The message you would like to display on the bottom of your invoice
      "bottom-notice": "Kindly pay your invoice within 14 days.",
      // Settings to customize your invoice
      "settings": {
          "currency": "EUR", // See documentation 'Locales and Currency' for more info. Leave empty for no currency.
          
      },
      // Translate your invoice to your preferred language
      
    };

    //Create your invoice! Easy!
    easyinvoice.createInvoice(data, function (result) {
      //The response will contain a base64 encoded PDF file
      console.log('PDF base64 string: ', result.pdf);
    });
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
    date = new Date(date)
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
