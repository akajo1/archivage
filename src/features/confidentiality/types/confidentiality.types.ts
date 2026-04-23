export type ConfidentialityLevel = 'public' | 'interne' | 'confidentiel' | 'secret';

export interface Confidentiality {
  id: string;
  level: ConfidentialityLevel;
}

