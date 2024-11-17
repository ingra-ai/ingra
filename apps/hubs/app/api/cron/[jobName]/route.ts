'use server';
import { ApiError } from '@repo/shared/types';
import { NextRequest, NextResponse } from 'next/server';

// import { apiTryCatch } from '@repo/shared/utils/apiTryCatch';
// import { googleOAuthRefresh } from './googleOAuthRefresh';

// export const runtime = 'edge';

export async function GET(request: NextRequest, { params }: { params: { jobName: string } }) {
  const jobName = params.jobName || '';

  switch (jobName) {
    case 'google-oauth-refresh':
      // return await apiTryCatch<any>(googleOAuthRefresh);
      return NextResponse.json(
        {
          status: 405,
          code: 'METHOD_NOT_ALLOWED',
          message: 'Disabled for now. Please contact support.',
        } as ApiError,
        {
          status: 405,
        }
      );
    default:
      return NextResponse.json(
        {
          status: 403,
          code: 'FORBIDDEN',
          message: 'You are not authorized to access this resource',
        } as ApiError,
        {
          status: 400,
        }
      );
  }
}
