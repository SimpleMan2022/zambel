import { jwtVerify, SignJWT } from "jose"

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "your-super-secret-key-change-this-in-production")

export interface JwtPayload {
  userId: number
  email: string
  iat: number
  exp: number
}

export async function signJwt(payload: { userId: number; email: string }): Promise<string> {
  const token = await new SignJWT(payload)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(JWT_SECRET)

  return token
}

export async function verifyJwt(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)

    if (!payload.userId || !payload.email) return null

    return payload as unknown as JwtPayload
  } catch {
    return null
  }
}

