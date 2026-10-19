export type GameMode = 'TITLE' | 'PLANT_SIM' | 'FLOWSHEET_BUILDER' | 'CLASS_QUIZ' | 'STAGE_SOLVER' | 'CERTIFICATE';

export interface PlantContract {
  id: string;
  title: string;
  material: string;
  targetSolute: string;
  inertMatrix: string;
  recommendedSolvent: string;
  solventsAvailable: {
    id: string;
    name: string;
    polarity: 'non-polar' | 'polar-protic' | 'polar-aprotic' | 'supercritical';
    boilingPointC: number;
    selectivityScore: number; // 1-10
    costPerKg: number;
    toxicityWarning?: string;
  }[];
  optimalTempRange: [number, number]; // Celsius
  optimalParticleMm: [number, number]; // mm
  optimalRatioSF: [number, number]; // Solvent to Feed mass ratio
  minRecoveryTarget: number; // e.g. 90%
  description: string;
  industrialContext: string;
  difficulty?: 'standard' | 'year3_advanced';
}

export interface SimulationParams {
  particleSizeMm: number; // 0.2 to 5.0 mm
  selectedSolventId: string;
  temperatureC: number; // 20 to 90 C
  agitationRpm: number; // 50 to 600 RPM
  solventToFeedRatio: number; // 1.0 to 6.0
  configuration: 'single' | 'cross_3' | 'counter_3';
}

export interface SimulationResults {
  recoveryPct: number;
  extractConcentrationPct: number;
  underflowResidualPct: number;
  extractionTimeMin: number;
  solventLossKg: number;
  energyScore: number;
  overallYieldScore: number; // 0 - 100
  warnings: string[];
  feedbackNotes: string[];
}

export interface QuizQuestion {
  id: number;
  topic: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  formulaNote?: string;
  difficulty?: 'standard' | 'year3_advanced';
  year3Category?: 'Mass Transfer Kinetics' | 'Hunter-Nash & Ponchon-Savarit' | 'Equilibrium & Kremser' | 'Transport Phenomena';
}

export interface FlowsheetNode {
  id: string;
  label: string;
  role: 'feed' | 'solvent' | 'extract' | 'raffinate' | 'stage';
  x: number;
  y: number;
}

export interface EquipmentMatchItem {
  id: string;
  name: string;
  type: 'Percolation' | 'Immersion' | 'Laboratory' | 'Continuous Decantation';
  mechanism: string;
  keyFeature: string;
  iconName: string;
}

export interface StudentProfile {
  name: string;
  matricNumber: string;
  groupName: string;
  totalScore: number;
  simStars: number;
  flowsheetScore: number;
  quizScore: number;
  solverScore: number;
  badges: string[];
}

export interface LeaderboardRecord {
  id: string;
  name: string;
  matricNumber: string;
  groupName: string;
  totalScore: number;
  simStars: number;
  flowsheetScore: number;
  quizScore: number;
  solverScore: number;
  badges: string[];
  updatedAt: string;
}
