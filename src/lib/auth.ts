import bcrypt from 'bcryptjs';
import * as jose from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export interface JwtPayload {
  id: string;
  email: string;
  role?: string; // Made role optional as it's not always present in generateToken
  iat?: number;
  exp?: number;
}

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const comparePassword = async (
    password: string,
    hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

export const generateToken = async (id: string, email: string, role?: string): Promise<string> => {
  console.log("[AUTH_LIB] Mencoba membuat token JWT.");
  if (!process.env.JWT_SECRET) {
    console.error("[AUTH_LIB] Error: JWT_SECRET tidak didefinisikan di environment variables saat membuat token.");
    throw new Error("JWT_SECRET is not defined in environment variables.");
  }
  const payload: { id: string; email: string; role?: string } = { id, email };
  if (role) {
    payload.role = role;
  }
  const token = await new jose.SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
  console.log("[AUTH_LIB] Token JWT berhasil dibuat.");
  return token;
};

export const verifyToken = async (token: string): Promise<JwtPayload | null> => {
  console.log("[AUTH_LIB] Mencoba memverifikasi token JWT.");
  if (!process.env.JWT_SECRET) {
    console.error("[AUTH_LIB] Error: JWT_SECRET tidak didefinisikan di environment variables saat memverifikasi token.");
    return null;
  }
  try {
    console.log("[AUTH_LIB] Token yang akan diverifikasi:", token);
    console.log("[AUTH_LIB] JWT_SECRET yang digunakan (length):")
    const { payload } = await jose.jwtVerify(token, JWT_SECRET);
    console.log("[AUTH_LIB] Token JWT berhasil diverifikasi.", payload);
    return payload as unknown as JwtPayload;
  } catch (error) {
    console.error("[AUTH_LIB] Error memverifikasi JWT token:", error);
    return null;
  }
};