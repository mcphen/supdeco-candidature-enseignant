// src/services/trackingService.ts

import http from '../api/http'
import { getUser, isAuthenticated } from './auth'

interface TrackingData {
  page_url: string;
  device_type: 'mobile' | 'desktop';
  user_agent: string;
  user_id?: number | null;
  plateforme: string;
}

/**
 * Enregistre les informations de navigation d'un utilisateur
 * - URL de la page
 * - Type d'appareil (mobile/desktop)
 * - User-Agent complet du navigateur
 * - ID de l'utilisateur (si connecté)
 */
export const trackUserActivity = async (): Promise<void> => {
  try {
    // Déterminer le type d'appareil (simple détection par largeur de fenêtre)
    const deviceType: TrackingData['device_type'] = window.innerWidth <= 768 ? 'mobile' : 'desktop'

    // Récupérer l'User-Agent complet et l'URL actuelle
    const userAgent = navigator.userAgent
    const currentUrl = window.location.href

    // Préparer les données
    const trackingData: TrackingData = {
      page_url: currentUrl,
      device_type: deviceType,
      user_agent: userAgent,
      plateforme: 'enseignant-candidature'
    }

    // Ajouter l'ID utilisateur si connecté
    if (isAuthenticated()) {
      const user = getUser()
      if (user?.id) {
        trackingData.user_id = user.id
      }
    }

    // Envoyer les données au serveur Laravel
    await http.post('/tracking/user-activity', trackingData)
  } catch (error) {
    // Silencieux en cas d'erreur pour ne pas perturber l'expérience utilisateur
    console.error("Erreur lors du suivi d'activité (enseignant):", error)
  }
}
