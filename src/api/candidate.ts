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
