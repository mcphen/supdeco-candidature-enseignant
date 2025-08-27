import http from '../api/http'
import type { CandidateInfo } from './auth'

export type LoginResponse = {
  token: string
  candidat: CandidateInfo
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const { data } = await http.post<LoginResponse>('/enseignants/login', { email, password })
  return data
}
