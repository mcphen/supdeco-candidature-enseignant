export interface Candidate {
  nom: string
  prenom: string
  email: string
  date_naissance: string // ISO date string
  lieu_naissance: string
  fonction_actuelle: string
  entreprise_universite: string
  dernier_diplome: string
  nb_experience_pedagogie: number
  nb_annee_experience_pro: number
  genre: 'H' | 'F' | 'Autre'
  nationalite: string
  domaines_expertise: string[] // list of selected items
  autres?: string
}

export interface CandidateResponse {
  id: number
  message: string
}
