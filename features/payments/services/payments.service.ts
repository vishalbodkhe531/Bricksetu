import { prisma } from '@/lib/prisma';
import type { PaymentInput } from '../types/payment.types';

/**
 * Payments service — server-only, pure Prisma queries.
 */

export async function getPayments(organizationId: string) {
  const list = await prisma.payments.findMany({
    where: { business_unit_id: organizationId },
    include: {
      payment_methods: true,
    },
    orderBy: { payment_date: 'desc' },
    take: 500,
  });

  return list.map((p) => ({
    id: p.id,
    organization_id: p.business_unit_id,
    customer_id: p.party_id || '',
    sales_order_id: null,
    amount: Number(p.amount_paise) / 100,
    payment_mode: (p.payment_methods?.name?.toLowerCase() || 'cash') as any,
    reference_number: p.reference_number,
    payment_date: p.payment_date.toISOString().split('T')[0],
    created_by: p.created_by,
    created_at: p.created_at.toISOString(),
  }));
}

export async function getPaymentById(id: string, organizationId: string) {
  const p = await prisma.payments.findFirst({
    where: { id, business_unit_id: organizationId },
    include: {
      payment_methods: true,
    },
  });

  if (!p) return null;

  return {
    id: p.id,
    organization_id: p.business_unit_id,
    customer_id: p.party_id || '',
    sales_order_id: null,
    amount: Number(p.amount_paise) / 100,
    payment_mode: (p.payment_methods?.name?.toLowerCase() || 'cash') as any,
    reference_number: p.reference_number,
    payment_date: p.payment_date.toISOString().split('T')[0],
    created_by: p.created_by,
    created_at: p.created_at.toISOString(),
  };
}

export async function createPayment(
  organizationId: string,
  createdBy: string,
  input: PaymentInput
) {
  const modeCode = (input.payment_mode || 'CASH').toUpperCase();
  let method = await prisma.payment_methods.findFirst({
    where: { code: modeCode },
  });

  if (!method) {
    method = await prisma.payment_methods.create({
      data: {
        code: modeCode,
        name: input.payment_mode || 'Cash',
      },
    });
  }

  const amountPaise = BigInt(Math.round((input.amount || 0) * 100));
  const paymentNum = `PAY-${Date.now()}`;

  const created = await prisma.payments.create({
    data: {
      business_unit_id: organizationId,
      payment_number: paymentNum,
      direction: 'INBOUND',
      party_type: 'CUSTOMER',
      party_id: input.customer_id,
      payment_date: input.payment_date ? new Date(input.payment_date) : new Date(),
      amount_paise: amountPaise,
      payment_method_id: method.id,
      reference_number: input.reference_number ?? null,
      created_by: createdBy,
    },
  });

  return {
    id: created.id,
    organization_id: created.business_unit_id,
    customer_id: created.party_id || '',
    sales_order_id: null,
    amount: Number(created.amount_paise) / 100,
    payment_mode: input.payment_mode || 'cash',
    reference_number: created.reference_number,
    payment_date: created.payment_date.toISOString().split('T')[0],
    created_by: created.created_by,
    created_at: created.created_at.toISOString(),
  };
}

export async function updatePayment(
  id: string,
  organizationId: string,
  input: Partial<PaymentInput>
) {
  const updateData: any = {};
  if (input.amount !== undefined) updateData.amount_paise = BigInt(Math.round(input.amount * 100));
  if (input.payment_date) updateData.payment_date = new Date(input.payment_date);
  if (input.reference_number !== undefined) updateData.reference_number = input.reference_number;

  const updated = await prisma.payments.update({
    where: { id },
    data: updateData,
  });

  return {
    id: updated.id,
    organization_id: updated.business_unit_id,
    customer_id: updated.party_id || '',
    sales_order_id: null,
    amount: Number(updated.amount_paise) / 100,
    payment_mode: input.payment_mode || 'cash',
    reference_number: updated.reference_number,
    payment_date: updated.payment_date.toISOString().split('T')[0],
    created_by: updated.created_by,
    created_at: updated.created_at.toISOString(),
  };
}

export async function deletePayment(id: string, organizationId: string) {
  await prisma.payments.delete({
    where: { id },
  });
}

/**
 * Summary: total payments received vs outstanding for a customer.
 */
export async function getPaymentSummaryByCustomer(customerId: string, organizationId: string) {
  const list = await prisma.payments.findMany({
    where: {
      business_unit_id: organizationId,
      party_id: customerId,
      party_type: 'CUSTOMER',
    },
    select: {
      amount_paise: true,
      payment_date: true,
    },
    orderBy: { payment_date: 'desc' },
  });

  const payments = list.map((p) => ({
    amount: Number(p.amount_paise) / 100,
    payment_date: p.payment_date.toISOString().split('T')[0],
  }));

  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  return { payments, total_paid: totalPaid };
}
