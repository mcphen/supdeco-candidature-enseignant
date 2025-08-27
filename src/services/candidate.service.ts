import http from '../api/http'
import type { Candidate, CandidateResponse } from '../interfaces/Candidate'

export const submitCandidate = async (payload: Candidate) => {
  const { data } = await http.post<CandidateResponse>('/enseignants/candidature', payload)
  return data
}
