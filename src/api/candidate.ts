import http from './http'
import type { Candidate } from '../interfaces/Candidate'

export async function getCandidature(id: number) {
  const { data } = await http.get(`/enseignants/candidatures/${id}`)
  return data as Candidate & { id: number; is_submitted?: boolean; submitted_at?: string|null; interview_at?: string|null; decision_status?: string|null; decision_at?: string|null }
}

export async function getCandidatureStatus(id: number) {
  const { data } = await http.get(`/enseignants/candidatures/${id}/status`)
  return data as { is_submitted: boolean; submitted_at: string|null; has_interview: boolean; interview_at: string|null; decision_status: string|null; decision_at: string|null }
}

export async function updateCandidature(id: number, payload: Candidate) {
  const { data } = await http.put(`/enseignants/candidatures/${id}`, payload)
  return data as { message: string; candidat: (Candidate & { id: number; is_submitted?: boolean; submitted_at?: string|null; interview_at?: string|null; decision_status?: string|null; decision_at?: string|null }) }
}

export async function updatePreferences(id: number, payload: { newsletter_opt_in: boolean; accepts_policies?: boolean }) {
  const { data } = await http.put(`/enseignants/candidatures/${id}/preferences`, payload)
  return data as { message: string }
}

export async function changePassword(id: number, payload: { current_password: string; new_password: string; new_password_confirmation: string }) {
  const { data } = await http.post(`/enseignants/candidatures/${id}/change-password`, payload)
  return data as { message: string }
}
