import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session';
import { recordAdvance } from '@/features/workers/services/workers.service';
import { advanceInputSchema } from '@/features/workers/types/worker.types';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = advanceInputSchema.parse(await req.json());
    const advance = await recordAdvance(body);
    return NextResponse.json(advance, { status: 201 });
  } catch (error: any) {
    console.error('[POST /api/workers/advances]', error);
    const isZodError = error?.name === 'ZodError';
    return NextResponse.json(
      { error: isZodError ? error.issues[0]?.message : (error.message ?? 'Internal server error') },
      { status: isZodError ? 400 : 500 }
    );
  }
}
