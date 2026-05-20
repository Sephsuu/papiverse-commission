# Commission Frontend Feature Guide

## Overview

The commission module consists of two major frontend features:

1. Commission Owner Setup
2. Monthly Commission Report Viewer

Base API prefix:

```text
/api/v1
```

---

# 1. Commission Owner Setup Module

This module allows administrators to:

* create commission owners
* rename commission owners
* delete commission owners
* assign products to owners
* remove assigned products
* view assigned products

Suggested frontend route:

```text
/admin/commissions/setup
```

---

# A. Load Commission Owners

## Endpoint

```http
GET /api/v1/commission-owners
```

## Purpose

Used when opening the commission setup screen.

The frontend should:

* load all commission owners
* display assigned products under each owner
* render owner cards or tables

## Suggested UI

```text
Commission Owners
------------------------------------------------
NEPH
Assigned Products:
- KARNE
- CHICKEN REGULAR

[Add Product] [Rename Owner] [Delete Owner]
```

## Suggested Components

```text
CommissionOwnerPage
CommissionOwnerCard
AssignedProductsTable
```

## Response Example

```json
[
  {
    "id": 1,
    "name": "NEPH",
    "assigned_products": [
      {
        "raw_material_id": 11,
        "sku": "KP-MEAT-00001",
        "name": "KARNE",
        "category": "MEAT",
        "capital": 450,
        "srp": 510
      }
    ]
  }
]
```

---

# B. Create Commission Owner

## Endpoint

```http
POST /api/v1/commission-owners
```

## Request

```json
{
  "name": "DELMAR"
}
```

## Frontend Features Needed

The frontend should provide:

* create owner modal or form
* validation for empty names
* loading state while submitting
* success/error feedback

## Suggested UI

```text
Owner Name: [__________]
[Create Owner]
```

## After Success

Frontend should:

* close modal
* clear input field
* refresh owner list
* or append the new owner locally to state

---

# C. Rename Commission Owner

## Endpoint

```http
PUT /api/v1/commission-owners/{ownerId}
```

## Request

```json
{
  "name": "NEPH"
}
```

## Frontend Features Needed

* rename modal
* owner name input
* update local UI state after success

## Suggested UI

```text
Rename Owner

Current Name: NEPH
New Name: [__________]

[Save]
```

## After Success

Frontend should:

* update owner name in UI
* show success message

---

# D. Delete Commission Owner

## Endpoint

```http
DELETE /api/v1/commission-owners/{ownerId}
```

## Response

```text
204 No Content
```

## Frontend Features Needed

* delete confirmation dialog
* remove owner from UI after success
* loading state while deleting

## Suggested UI

```text
Are you sure you want to delete NEPH?

This will also remove all product assignments.

[Cancel] [Delete]
```

## Important Note

Do not call:

```ts
await res.json()
```

for `204 No Content` responses.

---

# E. Load Available Products

## Endpoint

```http
GET /api/v1/commission-owners/{ownerId}/available-products
```

## Purpose

Used when opening the add-product modal.

The backend only returns:

* unassigned products
* PRODUCT type raw materials

## Frontend Features Needed

* add product modal
* product list rendering
* checkbox or multi-select support
* loading state

## Suggested UI

```text
Add Products to NEPH

[ ] CHICKEN REGULAR
[ ] PRODUCT 2
[ ] PRODUCT 3

[Assign Selected]
```

## Response Example

```json
[
  {
    "raw_material_id": 12,
    "sku": "KP-MEAT-00002",
    "name": "CHICKEN REGULAR",
    "category": "MEAT",
    "capital": 180,
    "srp": 220
  }
]
```

---

# F. Assign Products To Owner

## Endpoint

```http
POST /api/v1/commission-owners/{ownerId}/product-assignments
```

## Request

```json
{
  "rawMaterialIds": [12, 13, 14]
}
```

## Frontend Features Needed

* multiple product selection
* submit selected products
* display backend validation errors
* refresh owner data after success

## Common Backend Error

```json
{
  "message": "KARNE is already assigned to NEPH."
}
```

## Frontend Behavior

Display the backend error message in:

* toast
* alert
* form error message

---

# G. Remove Product Assignment

## Endpoint

```http
DELETE /api/v1/commission-owners/{ownerId}/product-assignments/{rawMaterialId}
```

## Response

```text
204 No Content
```

## Frontend Features Needed

* remove button per assigned product
* confirmation dialog (optional)
* update local UI after success

## Suggested UI

```text
KARNE   ₱450   ₱510   [Remove]
```

---

# 2. Monthly Commission Report Viewer

This module allows administrators to:

* select a month
* view commission reports grouped by owner
* view item totals
* view overall owner totals

Suggested frontend route:

```text
/admin/commissions/reports
```

---

# H. Select Report Month

## Endpoint

```http
GET /api/v1/commission-reports?month=2025-04
```

## Required Query Param

```text
month=YYYY-MM
```

## Frontend Features Needed

* month picker
* validation for empty month
* report reload on month change

## Suggested Input

```tsx
<input type="month" />
```

---

# I. Render Reports Grouped By Owner

## Response Structure

```json
{
  "month": "2025-04",
  "commissions": []
}
```

Each commission entry contains:

* owner/person
* items
* totals

## Frontend Rendering Strategy

Render one section per owner.

Example:

```text
NEPH
---------------------------------
Products Table
Totals

DELMAR
---------------------------------
Products Table
Totals
```

---

# J. Render Commission Items Table

## Response Example

```json
{
  "product": "KARNE",
  "qty": 2322,
  "capital": 450,
  "srp": 510,
  "gross": 1184220,
  "total_capital": 1044900,
  "net": 139320
}
```

## Suggested Table Columns

```text
Product
Quantity
Capital
SRP
Gross Sales
Total Capital
Net Commission
```

## Suggested Component

```text
CommissionItemsTable
```

---

# K. Empty State Handling

If:

```json
"items": []
```

The frontend should show:

```text
No sales for this month
```

Important:

Do not hide the owner section.

The owner still exists but simply has no sales for the selected month.

---

# L. Render Totals

## Totals Example

```json
"totals": {
  "gross": 1184220,
  "total_capital": 1044900,
  "net": 139320
}
```

## Frontend Should Display

```text
Total Gross
Total Capital
Total Net Commission
```

Most important value:

```text
totals.net
```

## Suggested Component

```text
CommissionTotalsCard
```

---

# Suggested Frontend Components

```text
CommissionSetupPage
CreateOwnerModal
RenameOwnerModal
DeleteOwnerDialog
CommissionOwnerCard
AssignedProductsTable
AddProductsModal
AvailableProductsTable
CommissionReportPage
MonthPicker
CommissionReportSection
CommissionItemsTable
CommissionTotalsCard
```

---

# Suggested TypeScript Types

```ts
export type AssignedProduct = {
  raw_material_id: number;
  sku: string;
  name: string;
  category: string;
  capital: number;
  srp: number;
};

export type CommissionOwner = {
  id: number;
  name: string;
  assigned_products: AssignedProduct[];
};

export type CommissionReportItem = {
  product: string;
  qty: number;
  capital: number;
  srp: number;
  gross: number;
  total_capital: number;
  net: number;
};

export type CommissionTotals = {
  gross: number;
  total_capital: number;
  net: number;
};

export type CommissionPersonReport = {
  person: string;
  items: CommissionReportItem[];
  totals: CommissionTotals;
};

export type CommissionReport = {
  month: string;
  commissions: CommissionPersonReport[];
};
```

---

# Suggested Frontend User Flow

## Setup Screen Flow

```text
Open Setup Screen
↓
GET /commission-owners
↓
Render owner list
↓
Add / Edit / Delete owner
↓
Assign or remove products
↓
Refresh owner state
```

---

## Report Screen Flow

```text
Open Report Screen
↓
Select Month
↓
GET /commission-reports?month=YYYY-MM
↓
Render grouped commission report
```

---

# Important Frontend Handling

Frontend should handle:

```text
Loading states
Error states
Empty owner list
Empty assigned products
Empty available products
Empty sales reports
Success notifications
Confirmation dialogs
204 No Content responses
```

---

# Summary

The commission frontend system needs two major modules:

## Commission Setup Module

Handles:

* owner management
* product assignments
* assignment removal
* owner maintenance

## Commission Report Module

Handles:

* monthly commission reports
* grouped owner reporting
* commission totals
* sales summaries
