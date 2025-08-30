import http from './http'

export type RawNotification = {
  id: number | string
  title?: string
  message?: string
  contenu?: string
  type?: 'info' | 'success' | 'warning' | string
  created_at?: string
  date?: string
}

export async function getNotifications(candidatureId: number): Promise<RawNotification[]> {
  const { data } = await http.get<RawNotification[]>(`/enseignants/candidatures/${candidatureId}/notifications`)
  return data
}

export async function createNotification(candidatureId: number, payload: { title?: string; message?: string; type?: 'info'|'success'|'warning'|string }) {
  const { data } = await http.post(`/enseignants/candidatures/${candidatureId}/notifications`, payload)
  return data as { id?: number|string; message?: string }
}
