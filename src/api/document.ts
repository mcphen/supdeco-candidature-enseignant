import http from './http'
import type { DocumentConfiguration, UploadResponse, SubmitResponse } from '../interfaces/Document'

export async function getDocumentConfigurations(): Promise<DocumentConfiguration[]> {
  const { data } = await http.get<DocumentConfiguration[]>('/enseignants/document-configurations')
  return data
}

export async function getCandidatureDocumentsStatus(candidatureId: number): Promise<{ has_started_upload: boolean; count: number; docs: Record<number, { id: number; document_configuration_id: number; file_url: string; file_name: string }> }> {
  const { data } = await http.get<{ has_started_upload: boolean; count: number; docs: Record<number, { id: number; document_configuration_id: number; file_url: string; file_name: string }> }>(`/enseignants/candidatures/${candidatureId}/documents/status`)
  return data
}

export async function uploadCandidatureDocument(candidatureId: number, formData: FormData) {
  const { data } = await http.post<UploadResponse>(`/enseignants/candidatures/${candidatureId}/documents`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return data
}

export async function submitCandidature(candidatureId: number): Promise<SubmitResponse> {
  const { data } = await http.post<SubmitResponse>(`/enseignants/candidatures/${candidatureId}/soumettre`)
  return data
}
