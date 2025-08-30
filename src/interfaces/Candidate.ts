export interface Candidate {
  nom: string
  prenom: string
  email: string
  telephone: string
  date_naissance: string // ISO date string
  lieu_naissance: string
  fonction_actuelle: string
  entreprise_universite: string
  dernier_diplome: string
  diplome_categorie: 'master' | 'doctorat' | 'certificat' | 'licence' | 'autre'
  nb_experience_pedagogie: number
  nb_annee_experience_pro: number
  genre: 'H' | 'F' | 'Autre'
  nationalite: string
  domaines_expertise: string[] // list of selected items
  autres?: string
  accepts_policies: boolean
  newsletter_opt_in?: boolean
}

export interface CandidateResponse {
  id: number
  message: string
}
