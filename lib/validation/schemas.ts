import { z } from 'zod';

// Shared ID validation
export const idParamSchema = z.string().min(1, 'ID is required');

// 1. Auth Schemas
export const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

// 2. Inventory Schemas
export const postStockAdjustmentSchema = z.object({
  finished_lot_id: z.string().min(1, 'Finished Lot ID is required'),
  adjustment_type: z.enum(['DAMAGE', 'THEFT', 'CORRECTION', 'OPENING_BALANCE', 'FOUND']),
  quantity_change: z.coerce.number().int().refine((n) => n !== 0, 'Quantity change cannot be zero'),
  reason: z.string().min(1, 'Reason is required'),
  adjustment_date: z.string().min(1, 'Adjustment date is required'),
});

// 3. Materials Schemas
export const createSupplierSchema = z.object({
  code: z.string().min(1, 'Supplier Code is required'),
  name: z.string().min(1, 'Supplier Name is required'),
  contact_person: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
});

export const createMaterialSchema = z.object({
  code: z.string().min(1, 'Material Code is required'),
  name: z.string().min(1, 'Material Name is required'),
  unit_id: z.string().min(1, 'Material Unit is required'),
  reorder_level: z.coerce.number().min(0, 'Reorder level must be >= 0').default(0),
  description: z.string().optional().nullable(),
});

export const createPurchaseSchema = z.object({
  supplier_id: z.string().min(1, 'Supplier is required'),
  material_id: z.string().min(1, 'Material is required'),
  purchase_date: z.string().min(1, 'Purchase Date is required'),
  quantity: z.coerce.number().gt(0, 'Quantity must be greater than 0'),
  unit_price: z.coerce.number().min(0, 'Unit Price must be >= 0'),
  notes: z.string().optional().nullable(),
});

export const consumeMaterialSchema = z.object({
  batch_id: z.string().optional().nullable(),
  material_id: z.string().min(1, 'Material is required'),
  consumption_date: z.string().min(1, 'Consumption Date is required'),
  quantity: z.coerce.number().gt(0, 'Quantity must be greater than 0'),
  notes: z.string().optional().nullable(),
});

// 4. Payments Schemas
export const createPaymentSchema = z.object({
  direction: z.enum(['INCOMING', 'OUTGOING']),
  party_type: z.enum(['CUSTOMER', 'SUPPLIER', 'WORKER', 'GENERAL']),
  party_id: z.string().optional().nullable(),
  payment_date: z.string().min(1, 'Payment Date is required'),
  amount: z.coerce.number().gt(0, 'Amount must be greater than 0'),
  payment_method_id: z.string().min(1, 'Payment Method is required'),
  reference_number: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const allocatePaymentSchema = z.object({
  payment_id: z.string().min(1, 'Payment ID is required'),
  allocations: z.array(
    z.object({
      charge_id: z.string().min(1, 'Charge ID is required'),
      amount_paise: z.coerce.number().gt(0, 'Allocated amount must be > 0'),
    })
  ).min(1, 'At least one allocation is required'),
});

// 5. Production Schemas
export const createBatchSchema = z.object({
  batch_number: z.string().min(1, 'Batch Number is required'),
  brick_type_id: z.string().min(1, 'Brick Type is required'),
  target_quantity: z.coerce.number().min(0).default(0),
  start_date: z.string().min(1, 'Start Date is required'),
  notes: z.string().optional().nullable(),
});

export const recordMouldingLogSchema = z.object({
  batch_id: z.string().min(1, 'Batch is required'),
  worker_id: z.string().min(1, 'Worker is required'),
  work_date: z.string().min(1, 'Work Date is required'),
  bricks_moulded: z.coerce.number().int().gt(0, 'Bricks Moulded count must be greater than 0'),
  notes: z.string().optional().nullable(),
});

export const transitionStageSchema = z.object({
  batch_id: z.string().min(1, 'Batch ID is required'),
  to_stage: z.string().min(1, 'Target Stage is required'),
  transition_date: z.string().min(1, 'Transition Date is required'),
  input_quantity: z.coerce.number().min(0, 'Input Quantity must be >= 0'),
  output_good_quantity: z.coerce.number().min(0).default(0),
  damaged_quantity: z.coerce.number().min(0).default(0),
  grade_allocations: z.record(z.string(), z.any()).optional().nullable(),
  notes: z.string().optional().nullable(),
});

// 6. Reports Schemas
export const reportFilterSchema = z.object({
  report_type: z.string().min(1, 'Report Type is required'),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
});

// 7. Sales Schemas
export const createCustomerSchema = z.object({
  code: z.string().min(1, 'Customer Code is required'),
  name: z.string().min(1, 'Customer Name is required'),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
});

export const postSaleSchema = z.object({
  customer_id: z.string().min(1, 'Customer is required'),
  brick_type_id: z.string().min(1, 'Brick Type is required'),
  brick_grade_id: z.string().min(1, 'Brick Grade is required'),
  sale_date: z.string().min(1, 'Sale Date is required'),
  quantity: z.coerce.number().int().gt(0, 'Quantity must be greater than 0'),
  unit_price: z.coerce.number().gt(0, 'Unit Price must be greater than 0'),
  vehicle_id: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

// 8. Settings Schemas
export const createBrickTypeSchema = z.object({
  code: z.string().min(1, 'Code is required'),
  name: z.string().min(1, 'Name is required'),
  dimensions: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
});

export const createBrickGradeSchema = z.object({
  code: z.string().min(1, 'Code is required'),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional().nullable(),
});

export const createExpenseCategorySchema = z.object({
  code: z.string().min(1, 'Code is required'),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional().nullable(),
});

export const createAdminUserSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  full_name: z.string().min(1, 'Full Name is required'),
});

export const recordOpeningBalanceSchema = z.object({
  type: z.string().min(1, 'Opening balance type is required'),
  details: z.any().refine((val) => val !== undefined && val !== null, 'Details are required'),
});

// 9. Transport Schemas
export const createVehicleSchema = z.object({
  registration_number: z.string().min(1, 'Registration Number is required'),
  driver_name: z.string().optional().nullable(),
  capacity_details: z.string().optional().nullable(),
});

export const logTripSchema = z.object({
  vehicle_id: z.string().min(1, 'Vehicle is required'),
  batch_id: z.string().optional().nullable(),
  sale_id: z.string().optional().nullable(),
  trip_date: z.string().min(1, 'Trip Date is required'),
  origin: z.string().optional().nullable(),
  destination: z.string().optional().nullable(),
  distance_km: z.coerce.number().min(0).default(0),
  cost: z.coerce.number().min(0, 'Cost must be >= 0'),
  notes: z.string().optional().nullable(),
});

// 10. Workers Schemas
export const createWorkerSchema = z.object({
  code: z.string().min(1, 'Worker Code is required'),
  full_name: z.string().min(1, 'Full Name is required'),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  payment_type: z.enum(['PIECE_RATE', 'DAILY_WAGE', 'MONTHLY_SALARY']).default('PIECE_RATE'),
  joining_date: z.string().min(1, 'Joining Date is required'),
  initial_rate: z.coerce.number().min(0).default(0),
});

export const addWorkerRateSchema = z.object({
  worker_id: z.string().min(1, 'Worker ID is required'),
  effective_date: z.string().min(1, 'Effective Date is required'),
  rate_rupees: z.coerce.number().min(0, 'Rate must be >= 0'),
});

export const unsettledWorkFilterSchema = z.object({
  worker_id: z.string().min(1, 'Worker ID is required'),
  start_date: z.string().min(1, 'Start Date is required'),
  end_date: z.string().min(1, 'End Date is required'),
});

export const generateSettlementSchema = z.object({
  worker_id: z.string().min(1, 'Worker ID is required'),
  start_date: z.string().min(1, 'Start Date is required'),
  end_date: z.string().min(1, 'End Date is required'),
  notes: z.string().optional().nullable(),
});

export const approveSettlementSchema = z.object({
  settlement_id: z.string().min(1, 'Settlement ID is required'),
});

export const voidSettlementSchema = z.object({
  settlement_id: z.string().min(1, 'Settlement ID is required'),
  reason: z.string().min(1, 'Void reason is required'),
});
