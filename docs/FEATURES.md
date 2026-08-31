# BrickSetu Feature Specifications

## 1. Authentication & Security
- **Login**: Single admin login page with username and password verification.
- **Session Management**: Cookie-based server sessions (`bricksetu_session`).
- **User Management**: Admin can create secondary admin user accounts for the business unit.

## 2. Dashboard
- **Operational Metrics**: Displays today/week/month production output, finished stock, total sales, receivables, payables, expenses, and pending worker dues.
- **Stock & Financial Alerts**: Highlights low material stock and overdue customer payments.
- **Quick Action Trigger**: Modal launcher for rapid entry of production, purchases, sales, payments, and expenses.

## 3. Workers & Wage Settlements
- **Worker Registry**: Tracks worker name, role, mobile number, active status, joining date, rate type, and rate history.
- **Advance Recording**: Logs wage advances granted to workers with automatic ledger balance calculation.
- **Weekly Settlement Engine**: Generates settlements for unbilled moulding work. Supports draft, approved, paid, and void states. Prevents double-billing work records.

## 4. Kiln Production & Batches
- **Kiln Batches**: Creates kiln batches with target start dates and total capacity.
- **Daily Moulding Log**: Records daily moulding quantity per worker per batch.
- **Batch Stage Workflow**: Controls transition through `MOULDING` → `DRYING` → `FIRING` → `FINISHED`. Calculates good bricks and damaged bricks.

## 5. Finished Stock & Inventory
- **Stock Breakdown**: Summarizes finished brick stock by brick type and grade (Class 1, Class 2, Waste).
- **Stock Ledger**: Immutable ledger of stock increases (from firing) and deductions (from sales).
- **Stock Adjustments**: Allows manual adjustments with mandatory audit reasons.

## 6. Materials & Suppliers
- **Supplier Directory**: Supplier contact details, payables, and purchase history.
- **Material Catalog**: Raw materials (coal, clay, sand, wood, diesel) with unit and reorder levels.
- **Purchases & Consumption**: Material lot creation from purchases and batch consumption via FIFO.

## 7. Sales & Customers
- **Customer Directory**: Customer profiles, contact details, total sales, and pending balances.
- **Sales Transactions**: Finished brick sales by type/grade with total cost calculation using FIFO stock deduction.

## 8. Payments & Financial Allocations
- **Payment Entry**: Incoming customer payments and outgoing supplier/worker/expense payments.
- **Unallocated Payment Ledger**: Tracks partial or unallocated payment balances.
- **Charge Allocation**: Allocates payment amounts directly to outstanding sales, purchases, or settlements.

## 9. Transport & Vehicle Tracking
- **Vehicle Directory**: Owned and hired vehicle numbers, drivers, and rate structures.
- **Transport Trips**: Records delivery trips per customer/batch, calculates freight charges, and tracks driver pay.

## 10. Reports & Profit Analytics
- **Production & Damage Report**: Daily and monthly production, good vs damaged percentage.
- **Stock Movement Report**: Opening stock, production in, sales out, closing stock.
- **Weekly Worker Payment Report**: Detailed breakdown of worker settlements and advances.
- **Material Consumption Report**: Material usage per batch and remaining lot balances.
- **Party Ledgers**: Detailed financial statement for any customer or supplier.
- **Transport Cost Report**: Total trips and transport expenses.
- **Batch Costing Report**: Material cost, labor cost, transport cost, and cost per 1,000 good bricks.
- **Operating Profit Report**: Sales revenue minus direct batch costs and general operational expenses.

## 11. Master Settings & Setup
- **Master Setup**: Configures brick types, brick grades, and expense categories.
- **Opening Balances**: Wizard to populate initial stock, material stock, customer receivables, and supplier payables.
