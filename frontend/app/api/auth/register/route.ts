import { NextRequest, NextResponse } from 'next/server';
import { registerUserSchema } from '../../../lib/schemas/registerUserSchema';
import { isNextResponse, postToAuthApi } from '../authApi';

export async function POST(request: NextRequest) {
  const body: unknown = await request.json().catch(() => null);
  const parsed = registerUserSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: 'Kontrollera e-postadress och lösenord.' },
      { status: 400 },
    );
  }

  if (process.env.NODE_ENV === 'development') {
    return NextResponse.json({ registered: true, mock: true }, { status: 201 });
  }

  const result = await postToAuthApi('register', {
    email: parsed.data.email,
    password: parsed.data.password,
  });
  if (isNextResponse(result)) {
    return result;
  }

  return NextResponse.json({ registered: true }, { status: 201 });
}
