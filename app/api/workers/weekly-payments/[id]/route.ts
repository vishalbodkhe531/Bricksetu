import { NextRequest } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { assertRole } from "@/lib/auth/guard";
import { successResponse, errorResponse } from "@/utils/api-response";
import { deleteWeeklyPayment } from "@/features/workers/services/weekly-payment.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return errorResponse("Unauthorized access", null, 401);
    }

    assertRole(user.role, ["owner", "manager", "admin"]);

    const { id: paymentId } = await params;
    if (
      !paymentId ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        paymentId
      )
    ) {
      return errorResponse("Invalid payment ID format", null, 400);
    }

    const result = await deleteWeeklyPayment(user.organization_id, paymentId);
    return successResponse(
      result,
      "साप्ताहिक पेमेंट नोंद हटवली (Weekly payment deleted successfully)"
    );
  } catch (error: unknown) {
    const err = error as Error;
    console.error("[DELETE /api/workers/weekly-payments/[id]]", err);
    return errorResponse(
      err?.message || "Failed to delete weekly payment",
      err
    );
  }
}
