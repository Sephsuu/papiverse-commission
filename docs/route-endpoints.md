# Route to API Endpoint Tracker (Role-Based)

Last updated: 2026-04-26

This file tracks frontend routes and backend endpoints used by each role.

## Shared (Franchisor/Admin + Franchisee)

### `/account`
- `/auth/update-credentials`
- `/user/update`
- `/user/{id}/profile-picture`

### `/messages`
- `/messaging/conversations/{userId}?page=1&limit=20`
- `/messaging/conversations/{conversationId}/messages?userId={userId}&page=1&limit=20`
- `/messaging/conversations`

### `/announcements`
- `/announcements/get-announcements`
- `/announcements/get-announcement?id={id}`
- `/announcements/create`
- `/announcements/update-announcement`
- `/announcements/delete?id={id}`
- `/events/get-by-date?date={date}`
- `/events/create`
- `/events/update`
- `/events/delete-by-id?id={id}`

### `/inventory/inventories`
- `/inventory/get-by-branch?id={id}&page={page}&size={size}&rawMaterialType={type}`
- `/inventory/get-by-branch-breakdown?id={id}&page={page}&size={size}&rawMaterialType={type}`
- `/inventory/get-audits?branchId={id}&source={source}&month={month}&year={year}&page={page}&size={size}&rawMaterialType={type}`
- `/inventory/get-item-audit?branchId={id}&code={code}&page={page}&size={size}`
- `/inventory/get-item-audit-by-date` (POST)
- `/inventory/process-transaction-input`
- `/inventory/process-transaction-order`
- `/inventory/update`

### `/inventory/raw-materials`
- `/inventory/get-by-branch?id={id}&page={page}&size={size}&rawMaterialType=RAW_MATERIAL`
- `/inventory/get-by-branch-breakdown?id={id}&page={page}&size={size}&rawMaterialType=RAW_MATERIAL`
- `/inventory/get-audits?...&rawMaterialType=RAW_MATERIAL`
- `/inventory/process-transaction-input`
- `/inventory/process-transaction-order`

### `/inventory/supply-orders`
### `/inventory/my-supply-orders`
- `/supply-order/get-all?start={start}&end={end}&type={type}`
- `/supply-order/get-by-branch?id={id}`
- `/supply-order/update-status?...`
- `/supply-order/update-expected?newExpected={date}&id={orderId}`
- `/supply-order/update-type`

### `/inventory/supply-orders/[id]`
- `/supply-order/get-by-orderId?id={id}`
- `/supply-order/add-remarks?id={id}&remarks={remarks}`
- `/supply-order/update-status?...`
- `/supply-order/update-expected?newExpected={date}&id={orderId}`
- `/supply-order/update-type`
- `/supply-order/export?orderId={id}&type={type}&category={category}`
- `/meat-order/update`
- `/snow-order/update`

### `/inventory/branch-purchase-item`
- `/supply-order/view-detailed?start={startDate}&end={endDate}`

### `/finance/supply-reports`
- `/inventory/get-commissary-finance-report?id={id}&start={startDate}&end={endDate}`

### `/finance/raw-material-reports`
- `/inventory/get-commissary-raw-material-finance-report?id={id}&start={startDate}&end={endDate}`

### `/finance/branch-po-report`
- `/branches/get-branches?page={page}&size={size}`
- `/supply-order/view-profit-branches?branchId={branchId}&start={startDate}&end={endDate}`

### `/finance/branch-po-report/[id]`
- `/supply-order/view-profit?id={orderId}`

### `/finance/expenses`
- `/expenses/range?startDate={startDate}&endDate={endDate}&page={page}&size={size}`
- `/expenses/{id}` (PUT)
- `/expenses/{id}` (DELETE)
- `/expenses/` (POST)
- `/financial-logs/get-expense?id={id}`

### `/sales`
- `/sales/get-overall?start={start}&end={end}`
- `/sales/get-summary?branchId={branchId}&start={start}&end={end}`
- `/sales/generate-graph-franchisor?startDate={start}&endDate={end}&filter={filter}`
- `/sales/generate-graph?branchId={branchId}&startDate={start}&endDate={end}&filter={filter}`
- `/sales/get-calendar?branchId={branchId}&month={month}&year={year}`

### `/sales/paid-orders`
- `/sales/get-detailed?branchId={branchId}&start={start}&end={end}&page={page}&size={size}`
- `/api/read-paid-orders`
- `/sales/upload?branchId={branchId}&historical={bool}`

### `/products`
### `/sales/products`
- `/products/get-all`
- `/products/get-by-code?code={id}`
- `/products/create`
- `/products/update`
- `/products/delete?id={id}`
- `/modifier-groups/get-all`
- `/modifier-groups/create`
- `/modifier-groups/update-by-id?id={id}`
- `/modifier-groups/delete-by-id?id={id}`
- `/modifier-items/get-all`
- `/modifier-items/get-by-group?id={id}`
- `/modifier-items/create`
- `/modifier-items/update-by-id?id={id}`
- `/modifier-items/delete-by-id?id={id}`
- `/product-link/get-products?group_id={id}`
- `/product-link/create`
- `/product-link/delete-links`

### `/sales/modifier/[id]`
- `/modifier-items/get-by-group?id={id}`
- `/product-link/get-products?group_id={id}`

### `/logs/supplies`
- `/inventory/get-audits?branchId={id}&source={source}&month={month}&year={year}&page={page}&size={size}&rawMaterialType=PRODUCT`
- `/inventory/get-item-audit?branchId={id}&code={code}&page={page}&size={size}`
- `/inventory/get-item-audit-by-date` (POST)

### `/logs/raw-materials`
- `/inventory/get-audits?branchId={id}&source={source}&month={month}&year={year}&page={page}&size={size}&rawMaterialType=RAW_MATERIAL`
- `/inventory/get-item-audit?branchId={id}&code={code}&page={page}&size={size}`
- `/inventory/get-item-audit-by-date` (POST)

### `/logs/supply-transactions`
- `/inventory/get-transaction-summary?id={id}&start={date}&end={date}&rawMaterialType=PRODUCT`

### `/logs/raw-material-transactions`
- `/inventory/get-transaction-summary?id={id}&start={date}&end={date}&rawMaterialType=RAW_MATERIAL`

## Franchisor/Admin

### `/users`
- `/user/get-users?page={page}&size={size}`
- `/user/find-user?id={id}`
- `/user/update`
- `/user/update-admin`
- `/user/delete-user?id={id}`
- `/user/{id}/profile-picture`
- `/auth/register`
- `/auth/resend-credentials?id={id}`

### `/branches`
- `/branches/get-branches?page={page}&size={size}`
- `/branches/find-branch?id={id}`
- `/branches/create`
- `/branches/update`
- `/branches/delete-by-id?id={id}`

### `/branches/inventory`
- `/branches/get-branches?page={page}&size={size}`
- `/inventory/get-by-branch?id={id}&page={page}&size={size}&rawMaterialType={type}`
- `/inventory/get-by-branch-breakdown?id={id}&page={page}&size={size}&rawMaterialType={type}`

### `/catalog/supplies`
- `/raw-materials/get-all?page={page}&size={size}`
- `/raw-materials/get-by-code?code={code}`
- `/raw-materials/get-price-history-by-code?code={code}`
- `/raw-materials/create`
- `/raw-materials/update`
- `/raw-materials/delete-by-code?code={code}`

### `/catalog/raw-materials`
- `/raw-materials/get-all?page={page}&size={size}&type=RAW_MATERIAL`
- `/raw-materials/create`
- `/raw-materials/update`
- `/raw-materials/delete-by-code?code={code}`

### `/finance/supply-breakdown`
- `/inventory/get-commissary-finance-breakdown?id={id}&start={startDate}&end={endDate}`

### `/finance/raw-material-breakdown`
- `/inventory/get-commissary-raw-material-finance-breakdown?id={id}&start={startDate}&end={endDate}`

### `/sales/branches`
- `/sales/get-summary?branchId={branchId}&start={start}&end={end}`
- `/sales/get-detailed?branchId={branchId}&start={start}&end={end}&page={page}&size={size}`

### `/sales/branch-ranking`
- `/sales/branch-ranking?start={start}&end={end}`

### `/sales/product-ranking`
- `/sales/products-ranking?start={start}&end={end}`

### `/inquiries`
- `/inquiry/get-all?status={status}`
- `/inquiry/update-by-id?id={id}&status={status}&userId={userId}`

## Franchisee

### `/employees`
- `/employees/get-by-branch?branchId={id}`
- `/employees/get-by-id?id={id}`
- `/employees/create`
- `/employees/update`
- `/employees/delete-by-id?id={id}`

### `/employees/positions`
- `/position/get-all`
- `/position/create`
- `/position/update?id={id}&name={name}`

### `/inventory/supply-order-form`
- `/raw-materials/get-deliverables?page={page}&size={size}`
- `/meat-order/create`
- `/snow-order/create`
- `/supply-order/create`

### `/inquiries/form`
- `/inquiry/create`

## Auth / Token Routes

### `/auth`
- `/auth/login`
- `/api/get-token`
- `/api/set-token`
- `/api/delete-token`

## Notes

- Sections above are based on current route guards in `src/app/(office)/**/page.tsx`.
- Some shared routes may still render different data per role using branch-scoped params and backend authorization.
