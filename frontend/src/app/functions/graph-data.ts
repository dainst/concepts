import {GraphLink, GraphNode} from '../interfaces/graph';
import {ConceptId} from 'concepts-common/interfaces/concept';

export const stringifyId = (cid: ConceptId|GraphNode): string => `${cid.id}«${cid.type}`;
export const stringifyLinkId = (link: GraphLink): string => {
  const sV = (v: string|number|GraphNode|ConceptId): string => {
    switch (typeof v) {
      case "string": return v;
      case "number": return `##${v}`;
      case "object": return stringifyId(v);
    }
  }
  return `${sV(link.source)}→${sV(link.relation)}→${sV(link.target)}`;
}


