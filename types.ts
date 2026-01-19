export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
}

export enum SEOPhase {
  CONFIG = 'Configuration',
  BLUEPRINT = 'Blueprint Review',
  GENERATION = 'Full Generation',
  DONE = 'Completed',
}

export interface SEOState {
  keyword: string;
  targetAudience: string;
  selectedTitle: string;
  currentPhase: SEOPhase;
}
