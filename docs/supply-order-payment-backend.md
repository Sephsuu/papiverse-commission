# SupplyOrderPaymentController Valid Request and Response Examples (All Fields)

Base path: `/api/v1/supply-order-payments`

## 1) Get Payment By ID
- `GET /api/v1/supply-order-payments/{id}`

### Request
```http
GET /api/v1/supply-order-payments/15
Authorization: Bearer <access_token>
```

### Response (200) `SupplyOrderPaymentResponse`
```json
{
  "paymentId": 15,
  "supplyOrderId": 501,
  "branchId": 2,
  "branchName": "KrispyPapi - Manila",
  "paymentDate": "2026-05-18",
  "paymentMode": "GCASH",
  "amount": 1500.00,
  "remarks": "Partial payment",
  "createdAt": "2026-05-18T10:30:15",
  "supplyOrderSnapshot": {
    "orderId": 501,
    "orderGrandTotal": 5000.00,
    "totalPaid": 1500.00,
    "remainingBalance": 3500.00,
    "paymentStatus": "PARTIAL",
    "isPaid": false
  }
}
```

## 2) Get All Payments (Non-paginated)
- `GET /api/v1/supply-order-payments`

### Request
```http
GET /api/v1/supply-order-payments
Authorization: Bearer <access_token>
```

### Response (200) `List<SupplyOrderPaymentResponse>`
```json
[
  {
    "paymentId": 16,
    "supplyOrderId": 501,
    "branchId": 2,
    "branchName": "KrispyPapi - Manila",
    "paymentDate": "2026-05-19",
    "paymentMode": "BPI",
    "amount": 2000.00,
    "remarks": "Second payment",
    "createdAt": "2026-05-19T09:15:00",
    "supplyOrderSnapshot": {
      "orderId": 501,
      "orderGrandTotal": 5000.00,
      "totalPaid": 3500.00,
      "remainingBalance": 1500.00,
      "paymentStatus": "PARTIAL",
      "isPaid": false
    }
  },
  {
    "paymentId": 15,
    "supplyOrderId": 501,
    "branchId": 2,
    "branchName": "KrispyPapi - Manila",
    "paymentDate": "2026-05-18",
    "paymentMode": "GCASH",
    "amount": 1500.00,
    "remarks": "Partial payment",
    "createdAt": "2026-05-18T10:30:15",
    "supplyOrderSnapshot": {
      "orderId": 501,
      "orderGrandTotal": 5000.00,
      "totalPaid": 1500.00,
      "remainingBalance": 3500.00,
      "paymentStatus": "PARTIAL",
      "isPaid": false
    }
  }
]
```

## 3) Get All Payments (Paginated)
- `GET /api/v1/supply-order-payments?page=0&size=10`

### Request
```http
GET /api/v1/supply-order-payments?page=0&size=10
Authorization: Bearer <access_token>
```

### Response (200) `Page<SupplyOrderPaymentResponse>`
```json
{
  "content": [
    {
      "paymentId": 16,
      "supplyOrderId": 501,
      "branchId": 2,
      "branchName": "KrispyPapi - Manila",
      "paymentDate": "2026-05-19",
      "paymentMode": "BPI",
      "amount": 2000.00,
      "remarks": "Second payment",
      "createdAt": "2026-05-19T09:15:00",
      "supplyOrderSnapshot": {
        "orderId": 501,
        "orderGrandTotal": 5000.00,
        "totalPaid": 3500.00,
        "remainingBalance": 1500.00,
        "paymentStatus": "PARTIAL",
        "isPaid": false
      }
    }
  ],
  "totalElements": 2,
  "totalPages": 1,
  "size": 10,
  "number": 0,
  "first": true,
  "last": true,
  "empty": false
}
```

## 4) Get Payments By Supply Order ID
- `GET /api/v1/supply-order-payments/supply-orders/{supplyOrderId}`

### Request
```http
GET /api/v1/supply-order-payments/supply-orders/501
Authorization: Bearer <access_token>
```

### Response (200) `List<SupplyOrderPaymentResponse>`
```json
[
  {
    "paymentId": 16,
    "supplyOrderId": 501,
    "branchId": 2,
    "branchName": "KrispyPapi - Manila",
    "paymentDate": "2026-05-19",
    "paymentMode": "BPI",
    "amount": 2000.00,
    "remarks": "Second payment",
    "createdAt": "2026-05-19T09:15:00",
    "supplyOrderSnapshot": {
      "orderId": 501,
      "orderGrandTotal": 5000.00,
      "totalPaid": 3500.00,
      "remainingBalance": 1500.00,
      "paymentStatus": "PARTIAL",
      "isPaid": false
    }
  }
]
```

## 5) Get Payments By Branch ID (Non-paginated)
- `GET /api/v1/supply-order-payments/branches/{branchId}`

### Request
```http
GET /api/v1/supply-order-payments/branches/2
Authorization: Bearer <access_token>
```

### Response (200) `List<SupplyOrderPaymentResponse>`
```json
[
  {
    "paymentId": 16,
    "supplyOrderId": 501,
    "branchId": 2,
    "branchName": "KrispyPapi - Manila",
    "paymentDate": "2026-05-19",
    "paymentMode": "BPI",
    "amount": 2000.00,
    "remarks": "Second payment",
    "createdAt": "2026-05-19T09:15:00",
    "supplyOrderSnapshot": {
      "orderId": 501,
      "orderGrandTotal": 5000.00,
      "totalPaid": 3500.00,
      "remainingBalance": 1500.00,
      "paymentStatus": "PARTIAL",
      "isPaid": false
    }
  }
]
```

## 6) Get Payments By Branch ID (Paginated)
- `GET /api/v1/supply-order-payments/branches/{branchId}?page=0&size=10`

### Request
```http
GET /api/v1/supply-order-payments/branches/2?page=0&size=10
Authorization: Bearer <access_token>
```

### Response (200) `Page<SupplyOrderPaymentResponse>`
```json
{
  "content": [
    {
      "paymentId": 16,
      "supplyOrderId": 501,
      "branchId": 2,
      "branchName": "KrispyPapi - Manila",
      "paymentDate": "2026-05-19",
      "paymentMode": "BPI",
      "amount": 2000.00,
      "remarks": "Second payment",
      "createdAt": "2026-05-19T09:15:00",
      "supplyOrderSnapshot": {
        "orderId": 501,
        "orderGrandTotal": 5000.00,
        "totalPaid": 3500.00,
        "remainingBalance": 1500.00,
        "paymentStatus": "PARTIAL",
        "isPaid": false
      }
    }
  ],
  "totalElements": 2,
  "totalPages": 1,
  "size": 10,
  "number": 0,
  "first": true,
  "last": true,
  "empty": false
}
```

## 7) Create Payment
- `POST /api/v1/supply-order-payments`

### Request
```http
POST /api/v1/supply-order-payments
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "supplyOrderId": 501,
  "paymentDate": "2026-05-18",
  "paymentMode": "GCASH",
  "amount": 1500.00,
  "remarks": "Partial payment"
}
```

### Response (201) `SupplyOrderPaymentResponse`
```json
{
  "paymentId": 15,
  "supplyOrderId": 501,
  "branchId": 2,
  "branchName": "KrispyPapi - Manila",
  "paymentDate": "2026-05-18",
  "paymentMode": "GCASH",
  "amount": 1500.00,
  "remarks": "Partial payment",
  "createdAt": "2026-05-18T10:30:15",
  "supplyOrderSnapshot": {
    "orderId": 501,
    "orderGrandTotal": 5000.00,
    "totalPaid": 1500.00,
    "remainingBalance": 3500.00,
    "paymentStatus": "PARTIAL",
    "isPaid": false
  }
}
```

## 8) Update Payment
- `POST /api/v1/supply-order-payments/{id}`

### Request
```http
POST /api/v1/supply-order-payments/15
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "supplyOrderId": 501,
  "paymentDate": "2026-05-19",
  "paymentMode": "BPI",
  "amount": 2000.00,
  "remarks": "Updated amount"
}
```

### Response (200) `SupplyOrderPaymentResponse`
```json
{
  "paymentId": 15,
  "supplyOrderId": 501,
  "branchId": 2,
  "branchName": "KrispyPapi - Manila",
  "paymentDate": "2026-05-19",
  "paymentMode": "BPI",
  "amount": 2000.00,
  "remarks": "Updated amount",
  "createdAt": "2026-05-18T10:30:15",
  "supplyOrderSnapshot": {
    "orderId": 501,
    "orderGrandTotal": 5000.00,
    "totalPaid": 3500.00,
    "remainingBalance": 1500.00,
    "paymentStatus": "PARTIAL",
    "isPaid": false
  }
}
```

## 9) Delete Payment
- `POST /api/v1/supply-order-payments/{id}/deletion`

### Request
```http
POST /api/v1/supply-order-payments/15/deletion
Authorization: Bearer <access_token>
```

### Response (200)
```json
{
  "message": "Supply order payment deleted successfully."
}
```

## Validation Highlights
- `supplyOrderId`: required, must be > 0
- `paymentDate`: required
- `paymentMode`: required; valid values:
  - `BDO`
  - `EASTWEST`
  - `GCASH`
  - `BPI`
  - `GO_TYME`
  - `UNION_BANK`
  - `INTERNAL`
  - `CASH`
- `amount`: required, minimum `0.01`
- `remarks`: optional, max 1000 chars
