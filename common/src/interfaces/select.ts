import {XOR} from '../types/essentials';

export interface ById {
  id: string;
  type: string;
}

export interface BySearch {
  q: string;
}

export interface BySearchHash {
  hash: string;
}


export type ConceptSelector = XOR<XOR<ById, BySearch>, BySearchHash>;
