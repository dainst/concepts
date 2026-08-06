import {GraphData, GraphNode} from '../interfaces/graph';
import {Concept, ConceptId} from 'concepts-common/interfaces/concept';

const uniqueConcepts = (concepts: ConceptId[]): ConceptId[] =>
  [...(new Map(concepts.map(c => [`${c.type}→→→${c.id}`, c]))).values()];

export const prepareGraphData = (concept: Concept): GraphData => {
  const protagonist: GraphNode = {...concept.id, concept};
  const links: { relation: ConceptId; source: ConceptId; target: ConceptId }[] = [
    ...(concept.relationsTo ?? [])
      .flatMap(r => r.objects.map(target => ({source: protagonist, relation: r.relation, target}))),
    ...(concept.relationsFrom ?? [])
      .flatMap(r => r.objects.map(target => ({source: protagonist, relation: r.relation, target}))),
  ];
  const nodes: GraphNode[] = [
    protagonist,
    ...links.map(r => r.target)
  ];
  return {links, nodes};
}

