import { prisma } from '@/lib/prisma';
import type { CustomerInput, SalesOrderInput } from '../types/sales.types';

export async function getCustomers(organizationId: string) {
  const list = await prisma.customers.findMany({
    where: { business_unit_id: organizationId, is_active: true },
    orderBy: { name: 'asc' },
  });

  return list.map((c) => ({
    id: c.id,
    organization_id: c.business_unit_id,
    name: c.name,
    phone: c.phone,
    address: c.address,
    created_at: c.created_at.toISOString(),
    updated_at: c.updated_at.toISOString(),
  }));
}

export async function getCustomerById(id: string, organizationId: string) {
  const c = await prisma.customers.findFirst({
    where: { id, business_unit_id: organizationId },
    include: {
      records: { orderBy: { sale_date: 'desc' } },
    },
  });

  if (!c) return null;

  return {
    id: c.id,
    organization_id: c.business_unit_id,
    name: c.name,
    phone: c.phone,
    address: c.address,
    created_at: c.created_at.toISOString(),
    updated_at: c.updated_at.toISOString(),
    sales_orders: c.records.map((r) => ({
      id: r.id,
      sale_number: r.sale_number,
      sale_date: r.sale_date.toISOString().split('T')[0],
      quantity: r.quantity,
      total_amount: Number(r.total_amount_paise) / 100,
    })),
  };
}

export async function createCustomer(organizationId: string, input: CustomerInput) {
  const code = `CUST-${Date.now()}`;
  const c = await prisma.customers.create({
    data: {
      business_unit_id: organizationId,
      code,
      name: input.name,
      phone: input.phone ?? null,
      address: input.address ?? null,
    },
  });

  return {
    id: c.id,
    organization_id: c.business_unit_id,
    name: c.name,
    phone: c.phone,
    address: c.address,
    created_at: c.created_at.toISOString(),
    updated_at: c.updated_at.toISOString(),
  };
}

export async function updateCustomer(id: string, organizationId: string, input: Partial<CustomerInput>) {
  const c = await prisma.customers.update({
    where: { id },
    data: {
      ...(input.name ? { name: input.name } : {}),
      ...(input.phone !== undefined ? { phone: input.phone } : {}),
      ...(input.address !== undefined ? { address: input.address } : {}),
    },
  });

  return {
    id: c.id,
    organization_id: c.business_unit_id,
    name: c.name,
    phone: c.phone,
    address: c.address,
    created_at: c.created_at.toISOString(),
    updated_at: c.updated_at.toISOString(),
  };
}

export async function getSalesOrders(organizationId: string) {
  const records = await prisma.records.findMany({
    where: { business_unit_id: organizationId },
    include: {
      customers: true,
      brick_types: true,
    },
    orderBy: { sale_date: 'desc' },
  });

  return records.map((r) => ({
    id: r.id,
    organization_id: r.business_unit_id,
    customer_id: r.customer_id,
    order_date: r.sale_date.toISOString().split('T')[0],
    status: 'COMPLETED',
    total_amount: Number(r.total_amount_paise) / 100,
    created_by: r.created_by,
    created_at: r.created_at.toISOString(),
    customers: r.customers
      ? {
          id: r.customers.id,
          name: r.customers.name,
          phone: r.customers.phone,
        }
      : null,
    sales_order_items: [
      {
        id: r.id,
        sales_order_id: r.id,
        brick_type_id: r.brick_type_id,
        quantity: r.quantity,
        rate_per_unit: Number(r.unit_price_paise) / 100,
      },
    ],
  }));
}

export async function getSalesOrderById(id: string, organizationId: string) {
  const r = await prisma.records.findFirst({
    where: { id, business_unit_id: organizationId },
    include: {
      customers: true,
      brick_types: true,
    },
  });

  if (!r) return null;

  return {
    id: r.id,
    organization_id: r.business_unit_id,
    customer_id: r.customer_id,
    order_date: r.sale_date.toISOString().split('T')[0],
    status: 'COMPLETED',
    total_amount: Number(r.total_amount_paise) / 100,
    created_by: r.created_by,
    created_at: r.created_at.toISOString(),
    customers: r.customers
      ? {
          id: r.customers.id,
          name: r.customers.name,
          phone: r.customers.phone,
          address: r.customers.address,
        }
      : null,
    sales_order_items: [
      {
        id: r.id,
        sales_order_id: r.id,
        brick_type_id: r.brick_type_id,
        quantity: r.quantity,
        rate_per_unit: Number(r.unit_price_paise) / 100,
        brick_types: r.brick_types
          ? {
              id: r.brick_types.id,
              name: r.brick_types.name,
            }
          : null,
      },
    ],
  };
}

export async function createSalesOrder(
  organizationId: string,
  createdBy: string,
  input: SalesOrderInput
) {
  // Use transaction to atomically insert sales records
  return await prisma.$transaction(async (tx) => {
    // Get default brick grade
    let grade = await tx.brick_grades.findFirst({
      where: { business_unit_id: organizationId },
    });
    if (!grade) {
      grade = await tx.brick_grades.create({
        data: {
          business_unit_id: organizationId,
          code: 'G1',
          name: 'First Class',
        },
      });
    }

    const item = input.items[0];
    const unitPricePaise = BigInt(Math.round((item?.rate_per_unit || 0) * 100));
    const totalAmountPaise = BigInt(
      Math.round(input.items.reduce((sum, i) => sum + i.quantity * i.rate_per_unit, 0) * 100)
    );
    const saleNum = `SALE-${Date.now()}`;

    const record = await tx.records.create({
      data: {
        business_unit_id: organizationId,
        sale_number: saleNum,
        customer_id: input.customer_id,
        brick_type_id: item?.brick_type_id || '',
        brick_grade_id: grade.id,
        sale_date: new Date(input.order_date),
        quantity: item?.quantity || 0,
        unit_price_paise: unitPricePaise,
        total_amount_paise: totalAmountPaise,
        created_by: createdBy,
      },
    });

    return {
      id: record.id,
      organization_id: record.business_unit_id,
      customer_id: record.customer_id,
      order_date: record.sale_date.toISOString().split('T')[0],
      status: 'COMPLETED',
      total_amount: Number(record.total_amount_paise) / 100,
      created_by: record.created_by,
      created_at: record.created_at.toISOString(),
    };
  });
}
