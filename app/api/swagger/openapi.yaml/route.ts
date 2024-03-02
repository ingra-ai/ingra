import { NextRequest, NextResponse } from 'next/server';
import { getSwaggerSpec } from '@/app/api/swagger/config';


export async function GET(request: NextRequest) {
  const swaggerSpec = await getSwaggerSpec();

  return NextResponse.json(
    swaggerSpec,
    {
      status: 200
    }
  );
};
