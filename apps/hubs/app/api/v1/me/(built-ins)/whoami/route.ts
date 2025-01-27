import { apiAuthTryCatch } from '@repo/shared/utils/apiAuthTryCatch';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  return await apiAuthTryCatch<any>(async (authSession) => {
    return NextResponse.json(
      {
        status: 'success',
        message: `You are authenticated.`,
        data: 'OK',
      },
      {
        status: 200,
      }
    );
  });
}
