import { NextRequest, NextResponse } from 'next/server';
import { registerUserSchema } from '../../../lib/schemas/registerUserSchema';
import { isNextResponse, postToAuthApi } from '../authApi';

const DEVELOPMENT_REGISTRATION_RESPONSE = {
  registered: true,
  mock: true,
};

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
    // Keep local registration flow predictable in dev without calling the backend.
    return NextResponse.json(DEVELOPMENT_REGISTRATION_RESPONSE, {
      status: 201,
    });
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
