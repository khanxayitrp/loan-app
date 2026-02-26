// src/types/upload.ts

export interface Document {
  id: number
  document_type: string
  file_url: string
  file_name: string
  uploaded_at: string
  application_id: number
}

export interface UploadDocumentPayload {
  application_id: number
  file: File
  doc_type: string
}

export interface UploadMultipleDocumentsPayload {
  application_id: number
  files: File[]
  doc_types: string[]
}
