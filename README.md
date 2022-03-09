# Description
This API is used for creating invoices in pdf format when a order is made in order service. The pdf will be uploaded to S3 and is accessible thru a link sent to email service

# Docs
endpoint for creating new invoice
 - creates pdf
 - sends presigned url to email service
 
 url found in google sheets 
 
 POST /invoice
 
```
 {
     "orderId": "string",
     "customerNumber": "string",
     "address":  "string",
     "date": "2022-03-03T21:59:08Z" | ISO 8601 UTC Date string,
     "email": "string", 
     "name": "string", 
     "itemId": "string",
     "token": "string",
     "price": "string"
 }
```
| Parameter | Description |
| --- | --- |
| `orderId` | **required** order specific unique id |
| `customerNumber` | **required** customer unique id |
| `address` | **required** shipping address |
| `date` | **required** date when order created |
| `email` | **required** customers email |
| `name` | **required** product name |
| `itemId` | **required** product unique id |
| `token` | **required** jwt token |
| `price` | **required** price |
