# SupplyOrderController Valid Request and Response Examples (All Fields)

Base path: `/api/v1/supply-order`

## 1) Create Order
- `POST /api/v1/supply-order/create`

### Request
```json
{
  "branchId": 2,
  "remarks": "Rush order",
  "meatCategoryItemId": "M-1001",
  "snowfrostCategoryItemId": "S-2001",
  "deliveryFee": 49.0,
  "internalShipment": false,
  "deliveryType": "DELIVERY",
  "expectedDelivery": "2026-05-20"
}
```

### Response (201) `OrderSummary`
```json
{
  "orderId": 501,
  "branchName": "KrispyPapi - Manila",
  "branchId": 2,
  "orderDate": "2026-05-18T11:00:00",
  "status": "PENDING",
  "remarks": "Rush order",
  "deliveryFee": 49.0,
  "deliveryType": "DELIVERY",
  "completeOrderTotalAmount": 5000.0,
  "totalPaid": 0.00,
  "remainingBalance": 5000.00,
  "paymentStatus": "UNPAID",
  "isPaid": false,
  "internalShipment": false,
  "expectedDelivery": "2026-05-20",
  "meatCategory": {
    "meatOrderId": "MEAT-0001",
    "meatItems": [
      {
        "rawMaterialCode": "KP-MEAT-12345",
        "rawMaterialName": "Chicken Breast",
        "quantity": 10.0,
        "unitMeasurement": "kg",
        "price": 220.0
      }
    ],
    "isApproved": false,
    "categoryTotal": 2200.0
  },
  "snowfrostCategory": {
    "snowFrostOrderId": "SNOW-0001",
    "snowFrostItems": [
      {
        "rawMaterialCode": "KP-SNOW-54321",
        "rawMaterialName": "Snow Mix",
        "quantity": 8.0,
        "unitMeasurement": "kg",
        "price": 300.0
      }
    ],
    "isApproved": false,
    "categoryTotal": 2400.0
  },
  "othersCategory": {
    "othersItems": [
      {
        "sourceCategory": "NONDELIVERABLES",
        "rawMaterialCode": "KP-ND-11111",
        "itemName": "Packaging",
        "quantity": 20.0,
        "unitPrice": 10.0,
        "totalPrice": 200.0,
        "excludeFromSales": false
      }
    ],
    "othersTotal": 200.0
  },
  "message": "Order created successfully",
  "lowStocks": [
    {
      "rawMaterialId": 99,
      "rawMaterialCode": "KP-MEAT-LOW01",
      "rawMaterialName": "Pork Belly",
      "unitMeasurement": "kg",
      "requiredQuantity": 15.0,
      "availableQuantity": 5.0,
      "shortageQuantity": 10.0,
      "expectedDeliveryDate": "2026-05-20",
      "expectedDateAvailableQuantity": 7.0,
      "expectedDateShortageQuantity": 8.0
    }
  ]
}
```

## 2) Get Order By Order ID
- `GET /api/v1/supply-order/get-by-orderId?id=501`

### Response (200) `OrderSummary`
```json
{
  "orderId": 501,
  "branchName": "KrispyPapi - Manila",
  "branchId": 2,
  "orderDate": "2026-05-18T11:00:00",
  "status": "APPROVED",
  "remarks": "Rush order",
  "deliveryFee": 49.0,
  "deliveryType": "DELIVERY",
  "completeOrderTotalAmount": 5000.0,
  "totalPaid": 1500.00,
  "remainingBalance": 3500.00,
  "paymentStatus": "PARTIAL",
  "isPaid": false,
  "internalShipment": false,
  "expectedDelivery": "2026-05-20",
  "meatCategory": {
    "meatOrderId": "MEAT-0001",
    "meatItems": [
      {
        "rawMaterialCode": "KP-MEAT-12345",
        "rawMaterialName": "Chicken Breast",
        "quantity": 10.0,
        "unitMeasurement": "kg",
        "price": 220.0
      }
    ],
    "isApproved": true,
    "categoryTotal": 2200.0
  },
  "snowfrostCategory": {
    "snowFrostOrderId": "SNOW-0001",
    "snowFrostItems": [
      {
        "rawMaterialCode": "KP-SNOW-54321",
        "rawMaterialName": "Snow Mix",
        "quantity": 8.0,
        "unitMeasurement": "kg",
        "price": 300.0
      }
    ],
    "isApproved": true,
    "categoryTotal": 2400.0
  },
  "othersCategory": {
    "othersItems": [
      {
        "sourceCategory": "NONDELIVERABLES",
        "rawMaterialCode": "KP-ND-11111",
        "itemName": "Packaging",
        "quantity": 20.0,
        "unitPrice": 10.0,
        "totalPrice": 200.0,
        "excludeFromSales": false
      }
    ],
    "othersTotal": 200.0
  },
  "message": "Order found",
  "lowStocks": []
}
```

## 3) Get Orders By Branch
- `GET /api/v1/supply-order/get-by-branch?id=2`

### Response (200) `List<OrderSummary>`
```json
[
  {
    "orderId": 501,
    "branchName": "KrispyPapi - Manila",
    "branchId": 2,
    "orderDate": "2026-05-18T11:00:00",
    "status": "APPROVED",
    "remarks": "Rush order",
    "deliveryFee": 49.0,
    "deliveryType": "DELIVERY",
    "completeOrderTotalAmount": 5000.0,
    "totalPaid": 1500.00,
    "remainingBalance": 3500.00,
    "paymentStatus": "PARTIAL",
    "isPaid": false,
    "internalShipment": false,
    "expectedDelivery": "2026-05-20",
    "meatCategory": {"meatOrderId":"MEAT-0001","meatItems":[],"isApproved":true,"categoryTotal":2200.0},
    "snowfrostCategory": {"snowFrostOrderId":"SNOW-0001","snowFrostItems":[],"isApproved":true,"categoryTotal":2400.0},
    "othersCategory": {"othersItems":[],"othersTotal":200.0},
    "message": "",
    "lowStocks": []
  }
]
```

## 4) Get All Orders
- `GET /api/v1/supply-order/get-all?type=branch&start=2026-05-01&end=2026-05-18`

### Response (200) `List<OrderSummary>`
```json
[
  {
    "orderId": 501,
    "branchName": "KrispyPapi - Manila",
    "branchId": 2,
    "orderDate": "2026-05-18T11:00:00",
    "status": "APPROVED",
    "remarks": "Rush order",
    "deliveryFee": 49.0,
    "deliveryType": "DELIVERY",
    "completeOrderTotalAmount": 5000.0,
    "totalPaid": 1500.00,
    "remainingBalance": 3500.00,
    "paymentStatus": "PARTIAL",
    "isPaid": false,
    "internalShipment": false,
    "expectedDelivery": "2026-05-20",
    "meatCategory": {"meatOrderId":"MEAT-0001","meatItems":[],"isApproved":true,"categoryTotal":2200.0},
    "snowfrostCategory": {"snowFrostOrderId":"SNOW-0001","snowFrostItems":[],"isApproved":true,"categoryTotal":2400.0},
    "othersCategory": {"othersItems":[],"othersTotal":200.0},
    "message": "",
    "lowStocks": []
  }
]
```

## 5) Update Order Status
- `POST /api/v1/supply-order/update-status?id=501&newStatus=APPROVED&meatApproved=true&snowApproved=true`

### Response (200) `OrderSummary`
```json
{
  "orderId": 501,
  "branchName": "KrispyPapi - Manila",
  "branchId": 2,
  "orderDate": "2026-05-18T11:00:00",
  "status": "APPROVED",
  "remarks": "Rush order",
  "deliveryFee": 49.0,
  "deliveryType": "DELIVERY",
  "completeOrderTotalAmount": 5000.0,
  "totalPaid": 1500.00,
  "remainingBalance": 3500.00,
  "paymentStatus": "PARTIAL",
  "isPaid": false,
  "internalShipment": false,
  "expectedDelivery": "2026-05-20",
  "meatCategory": {"meatOrderId":"MEAT-0001","meatItems":[],"isApproved":true,"categoryTotal":2200.0},
  "snowfrostCategory": {"snowFrostOrderId":"SNOW-0001","snowFrostItems":[],"isApproved":true,"categoryTotal":2400.0},
  "othersCategory": {"othersItems":[],"othersTotal":200.0},
  "message": "Status updated successfully",
  "lowStocks": []
}
```

## 6) Add Remarks
- `POST /api/v1/supply-order/add-remarks?id=501&remarks=Approved%20for%20dispatch`

### Response (200) `OrderSummary`
```json
{
  "orderId": 501,
  "branchName": "KrispyPapi - Manila",
  "branchId": 2,
  "orderDate": "2026-05-18T11:00:00",
  "status": "APPROVED",
  "remarks": "Approved for dispatch",
  "deliveryFee": 49.0,
  "deliveryType": "DELIVERY",
  "completeOrderTotalAmount": 5000.0,
  "totalPaid": 1500.00,
  "remainingBalance": 3500.00,
  "paymentStatus": "PARTIAL",
  "isPaid": false,
  "internalShipment": false,
  "expectedDelivery": "2026-05-20",
  "meatCategory": {"meatOrderId":"MEAT-0001","meatItems":[],"isApproved":true,"categoryTotal":2200.0},
  "snowfrostCategory": {"snowFrostOrderId":"SNOW-0001","snowFrostItems":[],"isApproved":true,"categoryTotal":2400.0},
  "othersCategory": {"othersItems":[],"othersTotal":200.0},
  "message": "Remarks updated",
  "lowStocks": []
}
```

## 7) View Out
- `GET /api/v1/supply-order/view-out?filter=WEEK&date=2026-05-18`

### Response (200) `List<RawMaterialOutResponse>`
```json
[
  {
    "rawMaterial": {
      "id": 10,
      "name": "Chicken Breast",
      "sku": "KP-MEAT-12345",
      "pricePerUnit": 220.0,
      "category": "MEAT"
    },
    "totalOut": 40.0,
    "totalIn": 120.0,
    "currentInventory": 250.0,
    "stockLevel": "GOOD",
    "previousInventory": 170.0
  }
]
```

## 8) View Detailed Out
- `GET /api/v1/supply-order/view-detailed-out?filter=CUSTOM_DATE&sku=KP-MEAT-12345&date=2026-05-18`

### Response (200) `SkuBranchDistributionResponse`
```json
{
  "dateRange": {
    "startDate": "2026-05-18",
    "endDate": "2026-05-18"
  },
  "branches": [
    {
      "branchName": "KrispyPapi - Manila",
      "totalOrder": 12.0
    }
  ]
}
```

## 9) View Detailed Table
- `GET /api/v1/supply-order/view-detailed?start=2026-05-01&end=2026-05-18`

### Response (200) `DetailedTable`
```json
{
  "dateRange": {
    "startDate": "2026-05-01",
    "endDate": "2026-05-18"
  },
  "items": [
    {
      "sku": "KP-MEAT-12345",
      "unitMeasurement": "kg",
      "name": "Chicken Breast",
      "branches": [
        {
          "branchName": "KrispyPapi - Manila",
          "totalOrder": 35.0
        }
      ]
    }
  ]
}
```

## 10) View Profit By Order
- `GET /api/v1/supply-order/view-profit?id=501`

### Response (200) `OrderProfitSummary`
```json
{
  "orderId": 501,
  "branchId": 2,
  "branchName": "KrispyPapi - Manila",
  "orderDate": "2026-05-18T11:00:00",
  "meatCategory": {
    "meatOrderId": "MEAT-0001",
    "meatItems": [
      {
        "rawMaterialId": 10,
        "rawMaterialCode": "KP-MEAT-12345",
        "rawMaterialName": "Chicken Breast",
        "quantity": 10.0,
        "unitMeasurement": "kg",
        "revenue": 2200.00,
        "cost": 1800.00,
        "profit": 400.00
      }
    ],
    "categoryProfit": 400.00
  },
  "snowCategory": {
    "snowOrderId": "SNOW-0001",
    "snowItems": [
      {
        "rawMaterialId": 20,
        "rawMaterialCode": "KP-SNOW-54321",
        "rawMaterialName": "Snow Mix",
        "quantity": 8.0,
        "unitMeasurement": "kg",
        "revenue": 2400.00,
        "cost": 2000.00,
        "profit": 400.00
      }
    ],
    "categoryProfit": 400.00
  },
  "overallCapital": 3800.00,
  "overallSales": 4600.00,
  "overallProfit": 800.00
}
```

## 11) View Profit By Date Range
- `GET /api/v1/supply-order/view-profit-date-range?start=2026-05-01&end=2026-05-18`

### Response (200) `DateRangeProfitSummary`
```json
{
  "startDate": "2026-05-01",
  "endDate": "2026-05-18",
  "orderCount": 25,
  "meatCategory": {
    "items": [
      {
        "rawMaterialId": 10,
        "rawMaterialCode": "KP-MEAT-12345",
        "rawMaterialName": "Chicken Breast",
        "quantity": 300.0,
        "unitMeasurement": "kg",
        "revenue": 66000.00,
        "cost": 54000.00,
        "profit": 12000.00
      }
    ],
    "categoryCapital": 54000.00,
    "categorySales": 66000.00,
    "categoryProfit": 12000.00
  },
  "snowCategory": {
    "items": [
      {
        "rawMaterialId": 20,
        "rawMaterialCode": "KP-SNOW-54321",
        "rawMaterialName": "Snow Mix",
        "quantity": 250.0,
        "unitMeasurement": "kg",
        "revenue": 75000.00,
        "cost": 62000.00,
        "profit": 13000.00
      }
    ],
    "categoryCapital": 62000.00,
    "categorySales": 75000.00,
    "categoryProfit": 13000.00
  },
  "overallCapital": 116000.00,
  "overallSales": 141000.00,
  "overallProfit": 25000.00
}
```

## 12) View Profit Per Branch
- `GET /api/v1/supply-order/view-profit-branches?branchId=2&start=2026-05-01&end=2026-05-18`

### Response (200) `BranchOrderProfitSummary`
```json
{
  "branchId": 2,
  "branchName": "KrispyPapi - Manila",
  "startDate": "2026-05-01",
  "endDate": "2026-05-18",
  "perOrderProfitBreakdown": [
    {
      "orderId": 501,
      "orderDate": "2026-05-18T11:00:00",
      "meatCategory": {
        "meatOrderId": "MEAT-0001",
        "meatItems": [],
        "categoryProfit": 400.00
      },
      "snowCategory": {
        "snowOrderId": "SNOW-0001",
        "snowItems": [],
        "categoryProfit": 400.00
      },
      "overallCapital": 3800.00,
      "overallSales": 4600.00,
      "overallProfit": 800.00
    }
  ],
  "overallCapital": 30000.00,
  "overallSales": 39000.00,
  "meatProfit": 4500.00,
  "snowProfit": 4500.00,
  "overallProfit": 9000.00
}
```

## 13) View Profit Rankings
- `GET /api/v1/supply-order/view-profit-rankings?start=2026-05-01&end=2026-05-18`

### Response (200) `BranchProfitRankingDashboardResponse`
```json
{
  "startDate": "2026-05-01",
  "endDate": "2026-05-18",
  "branchCount": 5,
  "totalOverallCapital": 120000.00,
  "totalOverallSales": 150000.00,
  "totalOverallProfit": 30000.00,
  "totalMeatProfit": 16000.00,
  "totalSnowProfit": 14000.00,
  "tableRows": [
    {
      "branchId": 2,
      "branchName": "KrispyPapi - Manila",
      "overallRank": 1,
      "meatRank": 1,
      "snowRank": 2,
      "overallCapital": 30000.00,
      "overallSales": 39000.00,
      "overallProfit": 9000.00,
      "meatProfit": 5000.00,
      "snowProfit": 4000.00
    }
  ],
  "overallRanking": [
    { "rank": 1, "branchId": 2, "branchName": "KrispyPapi - Manila", "amount": 9000.00 }
  ],
  "meatRanking": [
    { "rank": 1, "branchId": 2, "branchName": "KrispyPapi - Manila", "amount": 5000.00 }
  ],
  "snowRanking": [
    { "rank": 1, "branchId": 3, "branchName": "KrispyPapi - QC", "amount": 4500.00 }
  ],
  "chartData": {
    "labels": ["KrispyPapi - Manila"],
    "overallProfitSeries": [9000.00],
    "meatProfitSeries": [5000.00],
    "snowProfitSeries": [4000.00]
  }
}
```

## 14) Export PDF
- `GET /api/v1/supply-order/export?orderId=501&type=SALES&category=MEAT`

### Response (200)
- Headers include `Content-Disposition` and `Content-Type: application/pdf`
- Body is PDF bytes

## 15) Update Expected Date
- `POST /api/v1/supply-order/update-expected?newExpected=2026-05-22&id=501`

### Response (200)
```json
{
  "message": "Expected delivery date updated successfully"
}
```

## 16) Update Delivery Type
- `POST /api/v1/supply-order/update-type`

### Request
```json
{
  "isInternal": true,
  "type": "PICKUP",
  "orderId": 501
}
```

### Response (200)
```json
{
  "message": "Delivery type updated successfully"
}
```

## Enum Notes
- `filter` values for `/view-out` and `/view-detailed-out`: `WEEK`, `CUSTOM_DATE`
