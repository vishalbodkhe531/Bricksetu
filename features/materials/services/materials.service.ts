import { prisma } from "@/lib/prisma";
import type {
  RawMaterial,
  Supplier,
  RawMaterialInput,
  SupplierInput,
  MaterialListItem,
  MaterialDetail,
  MaterialCreateInput,
  MaterialUpdateInput,
  PurchaseRecord,
  ConsumptionRecord,
} from "../types/materials.types";

export class MaterialsService {
  /**
   * List basic raw materials for an organization
   */
  static async listMaterials(orgId: string): Promise<RawMaterial[]> {
    const items = await prisma.catalogue.findMany({
      where: { business_unit_id: orgId, is_active: true },
      include: { material_units: true },
      orderBy: { name: "asc" },
    });

    return items.map((item: any) => ({
      id: item.id,
      organization_id: item.business_unit_id,
      name: item.name,
      code: item.code,
      unit: item.material_units?.name || item.material_units?.code || "unit",
      reorder_level: item.reorder_level ? Number(item.reorder_level) : null,
      description: item.description,
      is_active: item.is_active,
      created_at: item.created_at.toISOString(),
      updated_at: item.created_at.toISOString(),
    }));
  }

  /**
   * List enriched materials with supplier, purchase stats & stock levels
   */
  static async listMaterialsEnriched(
    orgId: string,
  ): Promise<MaterialListItem[]> {
    const items = await prisma.catalogue.findMany({
      where: { business_unit_id: orgId },
      include: {
        material_units: true,
        purchases: {
          include: { suppliers: true },
          orderBy: { purchase_date: "desc" },
        },
        lots: true,
      },
      orderBy: { name: "asc" },
    });

    return items.map((item: any) => {
      const unit =
        item.material_units?.name || item.material_units?.code || "units";

      // Most recent supplier from purchases
      const recentPurchase = item.purchases[0];
      const primarySupplierName = recentPurchase?.suppliers?.name || null;

      const totalPurchases = item.purchases.length;
      const totalQtyPurchased = item.purchases.reduce(
        (sum: number, p: any) => sum + Number(p.quantity || 0),
        0,
      );

      const availableStock = item.lots.reduce(
        (sum: number, l: any) => sum + Number(l.available_quantity || 0),
        0,
      );

      return {
        id: item.id,
        name: item.name,
        code: item.code,
        unit,
        reorder_level: item.reorder_level ? Number(item.reorder_level) : null,
        description: item.description,
        is_active: item.is_active,
        primary_supplier_name: primarySupplierName,
        total_purchases: totalPurchases,
        total_quantity_purchased: totalQtyPurchased,
        available_stock: availableStock,
        created_at: item.created_at.toISOString(),
      };
    });
  }

  /**
   * Get full detail of a material
   */
  static async getMaterialDetail(
    orgId: string,
    materialId: string,
  ): Promise<MaterialDetail | null> {
    const item = await prisma.catalogue.findFirst({
      where: { id: materialId, business_unit_id: orgId },
      include: {
        material_units: true,
        purchases: {
          include: { suppliers: true },
          orderBy: { purchase_date: "desc" },
          take: 10,
        },
        lots: {
          include: {
            consumption: {
              include: { batches: true },
              orderBy: { consumption_date: "desc" },
              take: 10,
            },
          },
          orderBy: { received_date: "desc" },
        },
      },
    });

    if (!item) return null;

    const unit =
      item.material_units?.name || item.material_units?.code || "units";

    // Collect all distinct suppliers linked via purchases
    const supplierMap = new Map<string, Supplier>();
    item.purchases.forEach((p: any) => {
      if (p.suppliers && !supplierMap.has(p.suppliers.id)) {
        supplierMap.set(p.suppliers.id, {
          id: p.suppliers.id,
          organization_id: p.suppliers.business_unit_id,
          code: p.suppliers.code,
          name: p.suppliers.name,
          contact_person: p.suppliers.contact_person,
          phone: p.suppliers.phone,
          address: p.suppliers.address,
          created_at: p.suppliers.created_at.toISOString(),
          updated_at: p.suppliers.updated_at.toISOString(),
        });
      }
    });

    const suppliersList = Array.from(supplierMap.values());
    const primarySupplierName = suppliersList[0]?.name || null;

    const totalPurchases = item.purchases.length;
    const totalQtyPurchased = item.purchases.reduce(
      (sum: number, p: any) => sum + Number(p.quantity || 0),
      0,
    );

    const activeLots = item.lots.filter(
      (l: any) => Number(l.available_quantity) > 0,
    );
    const availableStock = item.lots.reduce(
      (sum: number, l: any) => sum + Number(l.available_quantity || 0),
      0,
    );

    const recentPurchases: PurchaseRecord[] = item.purchases.map((p: any) => ({
      id: p.id,
      purchase_number: p.purchase_number,
      supplier_name: p.suppliers?.name || "Unknown",
      supplier_id: p.supplier_id,
      purchase_date: p.purchase_date.toISOString().split("T")[0],
      quantity: Number(p.quantity),
      unit_price: Number(p.unit_price_paise) / 100,
      total_amount: Number(p.total_amount_paise) / 100,
      notes: p.notes,
    }));

    // Flatten consumption from lots
    const allConsumption: ConsumptionRecord[] = [];
    item.lots.forEach((lot: any) => {
      lot.consumption.forEach((c: any) => {
        allConsumption.push({
          id: c.id,
          batch_name: c.batches?.code || c.batches?.name || null,
          consumption_date: c.consumption_date.toISOString().split("T")[0],
          quantity: Number(c.quantity),
          cost: Number(c.cost_paise) / 100,
          notes: c.notes,
        });
      });
    });

    // Sort consumption by date descending
    allConsumption.sort(
      (a, b) =>
        new Date(b.consumption_date).getTime() -
        new Date(a.consumption_date).getTime(),
    );

    return {
      id: item.id,
      name: item.name,
      code: item.code,
      unit,
      reorder_level: item.reorder_level ? Number(item.reorder_level) : null,
      description: item.description,
      is_active: item.is_active,
      primary_supplier_name: primarySupplierName,
      total_purchases: totalPurchases,
      total_quantity_purchased: totalQtyPurchased,
      available_stock: availableStock,
      created_at: item.created_at.toISOString(),
      suppliers: suppliersList,
      recent_purchases: recentPurchases,
      recent_consumption: allConsumption.slice(0, 10),
      lots_summary: {
        total_lots: item.lots.length,
        active_lots: activeLots.length,
        total_available: availableStock,
      },
    };
  }

  /**
   * Helper to ensure material unit exists or is created
   */
  private static async getOrCreateUnit(unitName: string) {
    const unitCode = unitName.toUpperCase().replace(/\s+/g, "_");
    let unit = await prisma.material_units.findUnique({
      where: { code: unitCode },
    });

    if (!unit) {
      unit = await prisma.material_units.create({
        data: {
          code: unitCode,
          name: unitName,
        },
      });
    }
    return unit;
  }

  /**
   * Create material with optional supplier registration/linking
   */
  static async createMaterialWithSupplier(
    orgId: string,
    input: MaterialCreateInput,
  ): Promise<RawMaterial> {
    const unit = await this.getOrCreateUnit(input.unit);

    return await prisma.$transaction(async (tx) => {
      let selectedSupplierId: string | null = null;

      if (input.supplier_mode === "existing" && input.supplier_id) {
        selectedSupplierId = input.supplier_id;
      } else if (input.supplier_mode === "new" && input.new_supplier_name) {
        const supCode = `SUP-${Date.now()}`;
        const newSup = await tx.suppliers.create({
          data: {
            business_unit_id: orgId,
            code: supCode,
            name: input.new_supplier_name,
            contact_person: input.new_supplier_contact_person || null,
            phone: input.new_supplier_phone || null,
            address: input.new_supplier_address || null,
          },
        });
        selectedSupplierId = newSup.id;
      }

      const matCode = `MAT-${Date.now()}`;
      const createdMat = await tx.catalogue.create({
        data: {
          business_unit_id: orgId,
          code: matCode,
          name: input.name,
          unit_id: unit.id,
          reorder_level: 0,
          description: input.description ?? null,
        },
        include: { material_units: true },
      });

      const initialQty = input.quantity ? Number(input.quantity) : 0;
      const ratePerUnit = input.rate_per_unit ? Number(input.rate_per_unit) : 0;
      const totalCost = input.total_estimated_cost
        ? Number(input.total_estimated_cost)
        : initialQty * ratePerUnit;

      if (initialQty > 0) {
        const ratePaise = BigInt(Math.round(ratePerUnit * 100));
        const totalPaise = BigInt(Math.round(totalCost * 100));
        let purchaseId: string | null = null;

        if (selectedSupplierId) {
          const purNum = `PUR-${Date.now()}`;
          const purchase = await tx.purchases.create({
            data: {
              business_unit_id: orgId,
              purchase_number: purNum,
              supplier_id: selectedSupplierId,
              material_id: createdMat.id,
              purchase_date: new Date(),
              quantity: initialQty,
              unit_price_paise: ratePaise,
              total_amount_paise: totalPaise,
              notes: "Initial stock registration",
            },
          });
          purchaseId = purchase.id;
        }

        const lotNum = `LOT-INIT-${Date.now()}`;
        await tx.lots.create({
          data: {
            business_unit_id: orgId,
            material_id: createdMat.id,
            purchase_id: purchaseId,
            lot_number: lotNum,
            initial_quantity: initialQty,
            available_quantity: initialQty,
            unit_cost_paise: ratePaise,
            received_date: new Date(),
          },
        });
      }

      return {
        id: createdMat.id,
        organization_id: createdMat.business_unit_id,
        name: createdMat.name,
        code: createdMat.code,
        unit:
          createdMat.material_units?.name ||
          createdMat.material_units?.code ||
          input.unit,
        reorder_level: createdMat.reorder_level
          ? Number(createdMat.reorder_level)
          : null,
        description: createdMat.description,
        is_active: createdMat.is_active,
        created_at: createdMat.created_at.toISOString(),
        updated_at: createdMat.created_at.toISOString(),
      };
    });
  }

  /**
   * Update material details
   */
  static async updateMaterial(
    orgId: string,
    materialId: string,
    input: MaterialUpdateInput,
  ): Promise<RawMaterial> {
    let unitId: string | undefined = undefined;
    if (input.unit) {
      const unitObj = await this.getOrCreateUnit(input.unit);
      unitId = unitObj.id;
    }

    const updateData: Record<string, any> = {};
    if (input.name) updateData.name = input.name;
    if (unitId) updateData.unit_id = unitId;
    if (input.reorder_level !== undefined)
      updateData.reorder_level = input.reorder_level ?? 0;
    if (input.description !== undefined)
      updateData.description = input.description;
    if (input.is_active !== undefined) updateData.is_active = input.is_active;

    const updated = await prisma.catalogue.update({
      where: { id: materialId },
      data: updateData,
      include: { material_units: true },
    });

    const mu = updated.material_units as any;
    return {
      id: updated.id,
      organization_id: updated.business_unit_id,
      name: updated.name,
      code: updated.code,
      unit: mu?.name || mu?.code || "unit",
      reorder_level: updated.reorder_level
        ? Number(updated.reorder_level)
        : null,
      description: updated.description,
      is_active: updated.is_active,
      created_at: updated.created_at.toISOString(),
      updated_at: updated.created_at.toISOString(),
    };
  }

  /**
   * Get all purchases for a material
   */
  static async getMaterialPurchases(
    orgId: string,
    materialId: string,
  ): Promise<PurchaseRecord[]> {
    const list = await prisma.purchases.findMany({
      where: { business_unit_id: orgId, material_id: materialId },
      include: { suppliers: true },
      orderBy: { purchase_date: "desc" },
    });

    return list.map((p: any) => ({
      id: p.id,
      purchase_number: p.purchase_number,
      supplier_name: p.suppliers?.name || "Unknown Supplier",
      supplier_id: p.supplier_id,
      purchase_date: p.purchase_date.toISOString().split("T")[0],
      quantity: Number(p.quantity),
      unit_price: Number(p.unit_price_paise) / 100,
      total_amount: Number(p.total_amount_paise) / 100,
      notes: p.notes,
    }));
  }

  /**
   * Get all consumption logs for a material
   */
  static async getMaterialConsumption(
    orgId: string,
    materialId: string,
  ): Promise<ConsumptionRecord[]> {
    const lots = await prisma.lots.findMany({
      where: { business_unit_id: orgId, material_id: materialId },
      select: { id: true },
    });

    const lotIds = lots.map((l) => l.id);
    if (lotIds.length === 0) return [];

    const list = await prisma.consumption.findMany({
      where: { business_unit_id: orgId, material_lot_id: { in: lotIds } },
      include: { batches: true },
      orderBy: { consumption_date: "desc" },
    });

    return list.map((c: any) => ({
      id: c.id,
      batch_name: c.batches?.code || c.batches?.name || null,
      consumption_date: c.consumption_date.toISOString().split("T")[0],
      quantity: Number(c.quantity),
      cost: Number(c.cost_paise) / 100,
      notes: c.notes,
    }));
  }

  /**
   * Basic raw material creation
   */
  static async createMaterial(
    orgId: string,
    input: RawMaterialInput,
  ): Promise<RawMaterial> {
    const unit = await this.getOrCreateUnit(input.unit);
    const code = `MAT-${Date.now()}`;
    const created = await prisma.catalogue.create({
      data: {
        business_unit_id: orgId,
        code,
        name: input.name,
        unit_id: unit.id,
        reorder_level: 0,
        description: input.description ?? null,
      },
      include: { material_units: true },
    });

    return {
      id: created.id,
      organization_id: created.business_unit_id,
      name: created.name,
      code: created.code,
      unit:
        created.material_units?.name ||
        created.material_units?.code ||
        input.unit,
      reorder_level: created.reorder_level
        ? Number(created.reorder_level)
        : null,
      description: created.description,
      is_active: created.is_active,
      created_at: created.created_at.toISOString(),
      updated_at: created.created_at.toISOString(),
    };
  }

  /**
   * List all suppliers for an organization
   */
  static async listSuppliers(orgId: string): Promise<Supplier[]> {
    const list = await prisma.suppliers.findMany({
      where: { business_unit_id: orgId, is_active: true },
      orderBy: { name: "asc" },
    });

    return list.map((s: any) => ({
      id: s.id,
      organization_id: s.business_unit_id,
      code: s.code,
      name: s.name,
      contact_person: s.contact_person,
      phone: s.phone,
      address: s.address,
      is_active: s.is_active,
      created_at: s.created_at.toISOString(),
      updated_at: s.updated_at.toISOString(),
    }));
  }

  /**
   * Create a supplier
   */
  static async createSupplier(
    orgId: string,
    input: SupplierInput,
  ): Promise<Supplier> {
    const code = `SUP-${Date.now()}`;
    const s = await prisma.suppliers.create({
      data: {
        business_unit_id: orgId,
        code,
        name: input.name,
        contact_person: input.contact_person ?? null,
        phone: input.phone ?? null,
        address: input.address ?? null,
      },
    });

    return {
      id: s.id,
      organization_id: s.business_unit_id,
      code: s.code,
      name: s.name,
      contact_person: s.contact_person,
      phone: s.phone,
      address: s.address,
      is_active: s.is_active,
      created_at: s.created_at.toISOString(),
      updated_at: s.updated_at.toISOString(),
    };
  }
}
