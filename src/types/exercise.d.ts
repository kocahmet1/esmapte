export type BaseExercise = {
  id: string;
  prompt: string;
  timeLimitSec?: number;
};

export type MCOption = { id: string; text: string; correct: boolean };

export interface MCSingle extends BaseExercise {
  type: "mc_single";
  options: MCOption[];
}

export interface MCMulti extends BaseExercise {
  type: "mc_multi";
  options: MCOption[];
}

export interface Reorder extends BaseExercise {
  type: "reorder";
  sentences: { id: string; text: string }[]; // shuffled in file
  correctOrder: string[];
}

export interface DragBlank extends BaseExercise {
  type: "drag_blank";
  text: string; // add tokens like [1], [2]
  choices: { id: string; text: string }[];
  correctOrder: string[]; // array of choice ids in correct positions
}

export interface DropdownBlank extends BaseExercise {
  type: "dropdown_blank";
  text: string; // [1] placeholders
  optionsPerBlank: MCOption[][];
}

export interface Summarize extends BaseExercise {
  type: "summarize";
}

export interface Essay extends BaseExercise {
  type: "essay";
  text: string;
  wordLimit: { min: number; max: number };
}

export type Exercise =
  | MCSingle
  | MCMulti
  | Reorder
  | DragBlank
  | DropdownBlank
  | Summarize
  | Essay;
