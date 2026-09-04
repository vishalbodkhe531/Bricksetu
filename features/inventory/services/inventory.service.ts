import { prisma } from '@/lib/prisma';
import type { InventoryTransactionInput, RawMaterialInput } from '../types/inventory.types';

export async function getInventoryTransactions(organizationId: string) {
  const ledger = await prisma.stock_ledger.findMany({
    where: { business_unit_id: organizationId },
    include: {
      brick_types: true,
      users: { select: { id: true, full_name: true } },
    },
    orderBy: { transaction_date: 'desc' },
    take: 200,
  });

  return ledger.map((tx: any) => ({
    id: tx.id,
    organization_id: tx.business_unit_id,
    item_type: 'finished_goods' as const,
    item_id: tx.brick_type_id,
    transaction_type: (tx.quantity_change >= 0 ? 'in' : 'out') as 'in' | 'out',
    quantity: Math.abs(tx.quantity_change),
    reference_type: tx.reason,
    reference_id: tx.reference_id,
    transaction_date: tx.transaction_date.toISOString().split('T')[0],
    created_by: tx.created_by,
    created_at: tx.created_at.toISOString(),
  }));
}

export async function createInventoryTransaction(
  organizationId: string,
  createdBy: string,
  input: InventoryTransactionInput
) {
  const qtyChange = input.transaction_type === 'in' ? input.quantity : -input.quantity;

  const created = await prisma.stock_ledger.create({
    data: {
      business_unit_id: organizationId,
      brick_type_id: input.item_id,
      transaction_type: input.transaction_type.toUpperCase(),
      quantity_change: qtyChange,
      balance_after: qtyChange,
      transaction_date: new Date(input.transaction_date),
      reason: input.reference_type ?? null,
      reference_id: input.reference_id ?? null,
      created_by: createdBy,
    },
  });

  return {
    id: created.id,
    organization_id: created.business_unit_id,
    item_type: input.item_type,
    item_id: created.brick_type_id,
    transaction_type: input.transaction_type,
    quantity: input.quantity,
    reference_type: created.reason,
    reference_id: created.reference_id,
    transaction_date: created.transaction_date.toISOString().split('T')[0],
    created_by: created.created_by,
    created_at: created.created_at.toISOString(),
  };
}

export async function getRawMaterials(organizationId: string) {
  const items = await prisma.catalogue.findMany({
    where: { business_unit_id: organizationId, is_active: true },
    include: { material_units: true },
    orderBy: { name: 'asc' },
  });

  return items.map((item: any) => ({
    id: item.id,
    organization_id: item.business_unit_id,
    name: item.name,
    unit: item.material_units?.name || 'unit',
  }));
}

export async function createRawMaterial(organizationId: string, input: RawMaterialInput) {
  const unitCode = input.unit.toUpperCase().replace(/\s+/g, '_');
  let unit = await prisma.material_units.findUnique({
    where: { code: unitCode },
  });

  if (!unit) {
    unit = await prisma.material_units.create({
      data: {
        code: unitCode,
        name: input.unit,
      },
    });
  }

  const code = `MAT-${Date.now()}`;
  const created = await prisma.catalogue.create({
    data: {
      business_unit_id: organizationId,
      code,
      name: input.name,
      unit_id: unit.id,
    },
    include: { material_units: true },
  });

  return {
    id: created.id,
    organization_id: created.business_unit_id,
    name: created.name,
    unit: created.material_units?.name || input.unit,
  };
}

export async function getStockSummary(organizationId: string) {
  const stockByBrick = await prisma.stock_ledger.groupBy({
    by: ['business_unit_id', 'brick_type_id'],
    where: { business_unit_id: organizationId },
    _sum: {
      quantity_change: true,
    },
  });

  return stockByBrick.map((s: any) => ({
    item_id: s.brick_type_id,
    item_name: 'Brick',
    item_type: 'finished_goods' as const,
    unit: 'pcs',
    stock: s._sum.quantity_change || 0,
  }));
}
