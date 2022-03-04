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

module.exports.createPDF = async (orderId, customerId, address, invoiceDate, email, name, itemId, price) => {
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
          "company": customerId,
          "address": address,
          "custom1": email,
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
              "name": name,
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

    //Create your invoice! Easy!
    const result = await easyinvoice.createInvoice(data);
    
    return result.pdf
}

module.exports.sendInvoice = async (signedUrl, orderId, token) => {
    try {
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
      const mail = {
        'to': TEST_EMAIL,
        'subject': `Invoice on order: ${orderId}`,
        'body': signedUrl
        }
      const response = await axios.post(`${EMAIL_API}/sendmail`, mail, { headers: headers })
      return response.data
    } catch (err) {
      console.error(err)
      return err.message
    }
    
}