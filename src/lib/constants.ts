export const ARRETE_CATEGORIES = [
  'Sécurité publique',
  'Environnement',
  'Commerce',
  'Transport',
  'Fonction publique / RH',
  'Urbanisme',
  'Voirie',
  'État civil',
  'Finance',
  'Éducation',
  'Autre',
  'Sans catégorie'
] as const;

export type ArreteCategory = typeof ARRETE_CATEGORIES[number];

export const CATEGORY_COLORS: Record<string, 'neutral' | 'warning' | 'error' | 'success' | 'info' | 'purple' | 'orange' | 'blue' | 'pink' | 'indigo' | 'teal'> = {
  'Sécurité publique': 'warning',
  'Environnement': 'success',
  'Commerce': 'orange',
  'Transport': 'indigo',
  'Fonction publique / RH': 'pink',
  'Urbanisme': 'purple',
  'Voirie': 'neutral',
  'État civil': 'teal',
  'Finance': 'warning',
  'Éducation': 'info',
  'Autre': 'neutral',
  'Sans catégorie': 'neutral'
};
