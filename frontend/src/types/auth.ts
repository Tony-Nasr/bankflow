export interface AuthResponse {
  token: string
  fullName: string
  email: string
  role: string
  branchId: number | null
}

export interface LoginRequest {
  email: string
  password: string
}