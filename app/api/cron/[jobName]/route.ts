"use server";
import { NextRequest, NextResponse } from 'next/server';
import { ApiError } from '@lib/api-response';
import { apiTryCatch } from '@app/api/utils/apiTryCatch';
import { googleOAuthRefresh } from './googleOAuthRefresh';

// export const runtime = 'edge';

export async function GET(request: NextRequest, { params }: { params: { jobName: string } }) {
  const jobName = params.jobName || '';

  switch ( jobName ) {
    case 'google-oauth-refresh':
      return await apiTryCatch<any>(googleOAuthRefresh);
    default:
      return NextResponse.json(
        {
          status: 403,
          code: 'FORBIDDEN',
          message: 'You are not authorized to access this resource',
        } as ApiError,
        {
          status: 400
        }
      );
  }
};
