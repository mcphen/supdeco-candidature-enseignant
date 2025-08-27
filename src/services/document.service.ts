import { getDocumentConfigurations, uploadCandidatureDocument, submitCandidature } from '../api/document'
import type { DocumentConfiguration, UploadRecord, SubmitResponse, UploadResponse } from '../interfaces/Document'

export const listRequiredDocuments = async (): Promise<DocumentConfiguration[]> => {
  return await getDocumentConfigurations()
}

export const uploadDocumentForCandidature = async (candidatureId: number, formData: FormData): Promise<UploadResponse> => {
  return await uploadCandidatureDocument(candidatureId, formData)
}

export const submitCandidatureDossier = async (candidatureId: number): Promise<SubmitResponse> => {
  return await submitCandidature(candidatureId)
}
