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

export const CATEGORY_COLORS: Record<string, 'neutral' | 'warning' | 'error' | 'success' | 'info' | 'purple' | 'orange' | 'blue' | 'pink' | 'indigo' | 'teal' | 'rose' | 'cyan'> = {
  'Sécurité publique': 'blue',
  'Environnement': 'success',
  'Commerce': 'orange',
  'Transport': 'rose',
  'Fonction publique / RH': 'pink',
  'Urbanisme': 'purple',
  'Voirie': 'cyan',
  'État civil': 'info',
  'Finance': 'teal',
  'Éducation': 'warning',
  'Autre': 'neutral',
  'Sans catégorie': 'neutral'
};
