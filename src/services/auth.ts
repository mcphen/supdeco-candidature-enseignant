export type CandidateInfo = {
  id: number
  nom: string
  prenom: string
  email: string
  domaines_expertise?: string[]
}

const TOKEN_KEY = 'enseignant_token'
const USER_KEY = 'enseignant_user'

export function setSession(token: string, user: CandidateInfo) {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
  if (user?.id) {
    localStorage.setItem('enseignant_candidat_id', String(user.id))
  }
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function getUser(): CandidateInfo | null {
  const raw = localStorage.getItem(USER_KEY)
  return raw ? JSON.parse(raw) : null
}

export function isAuthenticated(): boolean {
  return !!getToken()
}
