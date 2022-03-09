const easyinvoice = require('easyinvoice');
const axios = require('axios')

const TEST_EMAIL = process.env.TEST_EMAIL
const EMAIL_API = process.env.EMAIL_API

const dateString = (date) => {
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0'); //January is 0!
    const yyyy = date.getFullYear();
      
    return dd + '.' + mm + '.' + yyyy;
}

module.exports.createPDF = async (orderId, customerId, address, invoiceDate, email, name, itemId, price) => {
    //date and duedate(+14)
    let date = new Date(invoiceDate)
    let due = new Date(invoiceDate)
    due.setDate(due.getDate()+14)
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
          "address": address,
          "custom1": email,
          "custom2": `Customer: ${customerId}`,
          "custom3": `Order: ${orderId}`,
      },
      "information": {
          // Invoice number
          "number": String(date.getTime()),
          // Invoice data
          "date": dateString(date),
          // Invoice due date
          "due-date": dateString(due)
      },
      "products": [
          {
              "quantity": 1,
              "description": name,
              "tax-rate": 24,
              "price": parseInt(price) / 1.24
          }
      ],
      // The message you would like to display on the bottom of your invoice
      "bottom-notice": "Kindly pay your invoice within 14 days.",
      // Settings to customize your invoice
      "settings": {
          "currency": "EUR", // See documentation 'Locales and Currency' for more info. Leave empty for no currency.
      },
    };

    //Create your invoice! 
    const result = await easyinvoice.createInvoice(data);
    // base64 encoded
    return result.pdf
}

module.exports.sendInvoice = async (signedUrl, orderId, token, email) => {
    try {
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
      const mail = {
        'to': email,
        'subject': `Invoice on order: ${orderId}`,
        'body': `If link is broken: remove the space and ! from the link... ${signedUrl}`,
        
        }
      const response = await axios.post(`${EMAIL_API}/sendmail`, mail, { headers: headers })
      return response.data
    } catch (err) {
      console.error(err)
      return err.message
    }
    
}