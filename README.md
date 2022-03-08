# CNA-invoice
This API is used for creating invoices in pdf format when a order is made in order service. The pdf will be uploaded to S3 and is accessible thru a link sent to email service

# Docs
POST endpoint for creating new invoice
 - creates pdf
 - sends presigned url to email service
 
 url found in google sheets 
 
 /invoice
 
```
 {
     order_id: string,
     customer_id: string,
     address:  string,
     date: Date
 }
```
