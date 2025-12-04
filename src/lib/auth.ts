import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET; // Removed default value

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

export const generateToken = (id: string, email: string, role?: string): string => {
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables.");
  }
  const payload: { id: string; email: string; role?: string } = { id, email };
  if (role) {
    payload.role = role;
  }
  const token = jwt.sign(
      payload,
      JWT_SECRET,
      { expiresIn: '7d' }
  );
  return token;
};

export const verifyToken = (token: string): JwtPayload |null => {
  if (!JWT_SECRET) {
    console.error("JWT_SECRET is not defined in environment variables.");
    return null;
  }
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch (error) {
    console.error("Error verifying JWT token:", error);
    return null;
  }
};