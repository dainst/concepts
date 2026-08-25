import {Concept, ConceptId} from 'concepts-common/interfaces/concept';
import d3 from 'd3';

export interface GraphNode extends ConceptId, d3.SimulationNodeDatum {
  concept: Concept | undefined;
  readonly distance: number;
}

export interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  readonly relation: ConceptId;
}

export interface GraphSettings {
  readonly expand: GraphExpansionProfile;
  readonly colors: GraphColorProfile;
  readonly linkForce: number;
  readonly maxNodes: number;
}

export interface GraphExpansionProfile {
  readonly [relationId: string]: number;
  readonly __default: number;
}

export type GraphNodeClassType = 'type' | 'distance' | 'domain' | 'none';

export interface GraphColorProfile {
  readonly colorizeNodesBy: GraphNodeClassType;
}

export interface GraphInfo {
  nodes: {
    classes: Map<string, {
      count: number;
      color: string;
    }>,
    classification: GraphNodeClassType;
    count: number;
    max: number;
  },
  profiles: {
    expand: string;
    colors: string;
  }
}
