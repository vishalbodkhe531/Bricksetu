import { NextRequest } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { assertRole } from "@/lib/auth/guard";
import { successResponse, errorResponse } from "@/utils/api-response";
import {
  getWeeklyPayments,
  recordWeeklyPayment,
} from "@/features/workers/services/weekly-payment.service";
import { weeklyPaymentInputSchema } from "@/features/workers/schemas/weekly-payment.schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return errorResponse("Unauthorized access", null, 401);
    }

    const { id: workerId } = await params;
    if (!workerId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(workerId)) {
      return errorResponse("Invalid worker ID format", null, 400);
    }

    const data = await getWeeklyPayments(user.organization_id, workerId);
    return successResponse(data);
  } catch (error: unknown) {
    const err = error as Error;
    console.error("[GET /api/workers/[id]/weekly-payments]", err);
    return errorResponse(err?.message || "Failed to fetch weekly payments", err);
  }
}

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return errorResponse("Unauthorized access", null, 401);
    }

    assertRole(user.role, ["owner", "manager", "admin", "clerk"]);

    const { id: workerId } = await params;
    if (!workerId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(workerId)) {
      return errorResponse("Invalid worker ID format", null, 400);
    }

    const json = await req.json();
    const validated = weeklyPaymentInputSchema.parse({
      ...json,
      worker_id: workerId,
    });

    const payment = await recordWeeklyPayment(
      user.organization_id,
      user.id,
      validated
    );

    return successResponse(
      payment,
      "साप्ताहिक पेमेंट यशस्वीरीत्या नोंदवले (Weekly payment recorded successfully)",
      201
    );
  } catch (error: unknown) {
    const err = error as Error;
    console.error("[POST /api/workers/[id]/weekly-payments]", err);
    return errorResponse(err?.message || "Failed to record weekly payment", err);
  }
}
