import { NextRequest } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { assertRole } from "@/lib/auth/guard";
import { successResponse, errorResponse } from "@/utils/api-response";
import { deleteDailyWorkLog } from "@/features/workers/services/daily-work.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return errorResponse("Unauthorized access", null, 401);
    }

    assertRole(user.role, ["owner", "manager", "admin"]);

    const { id } = await params;
    const result = await deleteDailyWorkLog(id, user.organization_id, user.id);
    return successResponse(result, "Daily work log deleted successfully");
  } catch (error: any) {
    console.error("[DELETE /api/workers/daily-work/[id]]", error);
    return errorResponse(error.message || "Failed to delete daily work log", error);
  }
}
