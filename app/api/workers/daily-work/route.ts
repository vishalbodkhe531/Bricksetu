import { NextRequest } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { assertRole } from "@/lib/auth/guard";
import { successResponse, errorResponse } from "@/utils/api-response";
import {
  recordDailyWork,
  recordBulkDailyWork,
  getDailyWorkLogs,
  getDailyWorkSummaryForToday,
} from "@/features/workers/services/daily-work.service";
import {
  dailyWorkInputSchema,
  bulkDailyWorkInputSchema,
} from "@/features/workers/schemas/daily-work.schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return errorResponse("Unauthorized access", null, 401);
    }

    const { searchParams } = new URL(req.url);
    const summaryOnly = searchParams.get("summary") === "true";
    const date = searchParams.get("date") || undefined;
    const workerId = searchParams.get("workerId") || undefined;
    const category = searchParams.get("category") || undefined;
    const startDate = searchParams.get("startDate") || undefined;
    const endDate = searchParams.get("endDate") || undefined;

    if (summaryOnly) {
      const summary = await getDailyWorkSummaryForToday(
        user.organization_id,
        date
      );
      return successResponse(summary);
    }

    const result = await getDailyWorkLogs(user.organization_id, {
      workerId,
      category,
      startDate,
      endDate,
    });

    return successResponse(result);
  } catch (error: any) {
    console.error("[GET /api/workers/daily-work]", error);
    return errorResponse("Failed to fetch daily work logs", error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return errorResponse("Unauthorized access", null, 401);
    }

    assertRole(user.role, ["owner", "manager", "admin"]);

    const json = await req.json();

    // Check if bulk or single
    if (json.entries && Array.isArray(json.entries)) {
      const bulkBody = bulkDailyWorkInputSchema.parse(json);
      const logs = await recordBulkDailyWork(
        user.organization_id,
        bulkBody,
        user.id
      );
      return successResponse(logs, "Bulk daily work logs recorded successfully", 201);
    } else {
      const body = dailyWorkInputSchema.parse(json);
      const log = await recordDailyWork(user.organization_id, body, user.id);
      return successResponse(log, "Daily work log recorded successfully", 201);
    }
  } catch (error: any) {
    console.error("[POST /api/workers/daily-work]", error);
    return errorResponse("Failed to record daily work", error);
  }
}
