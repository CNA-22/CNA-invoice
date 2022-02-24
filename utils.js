const easyinvoice = require('easyinvoice');
const axios = require('axios')

const TEST_EMAIL = process.env.TEST_EMAIL
const EMAIL_API = process.env.EMAIL_API
const JWT_DUMMY = process.env.JWT_DUMMY

const dateString = (date) => {
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0'); //January is 0!
    const yyyy = date.getFullYear();
      
    return dd + '.' + mm + '.' + yyyy;
}

module.exports.createPDF = async (orderId, customerId, address, invoiceDate) => {
    let date = new Date(invoiceDate)
    let due = new Date(invoiceDate)
    let dueDate = due.setDate(due.getDate()+14)
    let data = {
      "sender": {
          "company": "Scalperz Oy",
          "address": "Romgatan 5",
          "zip": "00550",
          "city": "Helsinki",
          "country": "Finland"
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
          "number": String(date.getTime()) + "-"+customerId,
          // Invoice data
          "date": dateString(date),
          // Invoice due date
          "due-date": dateString(due)
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
    };

    //Create your invoice! Easy!
    const result = await easyinvoice.createInvoice(data);
    
    return result.pdf
}

module.exports.sendInvoice = async (signedUrl, orderId) => {
    try {
      const headers = {
        'Authorization': `Bearer ${JWT_DUMMY}`,
        'Content-Type': 'application/json'
      }
      const mail = {
        'to': 'hackmano@arcada.fi',
        'subject': `Invoice on order: ${orderId}`,
        'body': 'test'
        }
      const response = await axios.post(`${EMAIL_API}/sendmail`, mail, { headers: headers })
      return response.data
    } catch (err) {
      console.error(err)
      return err.message
    }
    
}