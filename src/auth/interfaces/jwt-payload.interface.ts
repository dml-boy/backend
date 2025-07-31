export interface JwtPayload {
  sub: number;        // User ID (standard JWT "subject" claim)
  email: string;      // User's email
  role: 'ADMIN' | 'EMPLOYEE';  // Role-based access (can be extended)
  name?: string;      // Optional: user's name
  iat?: number;       // Issued at (auto-filled by JWT library)
  exp?: number;       // Expiry (optional, but auto-filled if using `expiresIn`)
}
