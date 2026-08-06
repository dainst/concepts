import {Concept, ConceptId} from 'concepts-common/interfaces/concept';
import d3 from 'd3';

export interface GraphNode extends ConceptId, d3.SimulationNodeDatum {
  concept?: Concept;
}

export interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  readonly relation: ConceptId
}

export interface GraphData {
  links: GraphLink[];
  nodes: GraphNode[];
}
