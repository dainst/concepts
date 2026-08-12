import {Concept, ConceptId} from 'concepts-common/interfaces/concept';
import d3 from 'd3';

export type RelativeNodePosition = '←' | '→' | 'o';

export interface GraphNode extends ConceptId, d3.SimulationNodeDatum {
  concept: Concept | undefined;
  readonly distance: number;
  readonly relativePosition: RelativeNodePosition;
}

export interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  readonly relation: ConceptId;
  readonly direction: '←' | '→';
}

export interface GraphSettings {
  readonly expand: {
    readonly forward: {readonly [relationId: string]: number},
    readonly backward: {readonly [relationId: string]: number}
    readonly default: {
      readonly forward: number;
      readonly backward: number;
    }
  },
  readonly linkForce: number;
  readonly maxNodes: number;
}
