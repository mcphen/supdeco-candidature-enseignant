export interface DocumentConfiguration {
  id: number
  intitule: string
}

export interface UploadRecord {
  id: number
  document_configuration_id: number
  file_url: string
}

export interface UploadResponse {
  doc: UploadRecord
}

export interface SubmitResponse {
  ok?: boolean
  message?: string
}
