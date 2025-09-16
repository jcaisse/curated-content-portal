import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// Ensure Node.js runtime for Prisma compatibility
export const runtime = 'nodejs';

interface AuthCheckRequest {
  email: string;
  password: string;
}

interface AuthCheckResponse {
  ok: boolean;
  reason?: string;
  timestamp: number;
}

/**
 * Test-only credentials endpoint for smoke testing authentication
 * Only enabled when E2E_TEST_MODE=true
 */
export async function POST(request: NextRequest): Promise<NextResponse<AuthCheckResponse>> {
  // Only allow in test mode
  if (process.env.E2E_TEST_MODE !== 'true') {
    return NextResponse.json(
      { 
        ok: false, 
        reason: 'Auth check endpoint only available in E2E_TEST_MODE',
        timestamp: Date.now()
      },
      { status: 403 }
    );
  }

  try {
    const body: AuthCheckRequest = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { 
          ok: false, 
          reason: 'Email and password are required',
          timestamp: Date.now()
        },
        { status: 400 }
      );
    }

    // Rate limiting (simple in-memory for test endpoint)
    const clientIp = request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitKey = `auth_check_${clientIp}`;
    
    // Simple rate limiting: max 10 requests per minute per IP
    // In a real implementation, you'd use Redis or similar
    // For now, we'll just allow it since this is test-only

    // Perform the same authentication logic as the real authorize() function
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        role: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { 
          ok: false, 
          reason: 'User not found',
          timestamp: Date.now()
        },
        { status: 401 }
      );
    }

    if (!user.password) {
      return NextResponse.json(
        { 
          ok: false, 
          reason: 'User has no password set',
          timestamp: Date.now()
        },
        { status: 401 }
      );
    }

    // Check if password is bcrypt hashed or plain text (for testing)
    let passwordMatch = false;
    
    if (user.password.startsWith('$2')) {
      // Bcrypt hashed password
      passwordMatch = await bcrypt.compare(password, user.password);
    } else {
      // Plain text password (for testing only)
      passwordMatch = password === user.password;
    }

    if (!passwordMatch) {
      return NextResponse.json(
        { 
          ok: false, 
          reason: 'Invalid password',
          timestamp: Date.now()
        },
        { status: 401 }
      );
    }

    // Success
    return NextResponse.json(
      { 
        ok: true,
        timestamp: Date.now()
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Auth check error:', error);
    
    return NextResponse.json(
      { 
        ok: false, 
        reason: `Internal error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: Date.now()
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint for health check
 */
export async function GET(): Promise<NextResponse> {
  const isTestMode = process.env.E2E_TEST_MODE === 'true';
  
  return NextResponse.json(
    { 
      enabled: isTestMode,
      timestamp: Date.now()
    },
    { status: isTestMode ? 200 : 403 }
  );
}
