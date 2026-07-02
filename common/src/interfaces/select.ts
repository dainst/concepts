import {XOR} from '../types/essentials';

export interface ById {
  id: string;
  type: string;
}

export interface ByQ {
  q: string;
}

export type ConceptSelector = XOR<ById, ByQ>;
