import {ConceptId, Relation, RelationSet, RelationSetObject, RelationWithOutSubject} from '../interfaces/concept';

export const unpackRelationSets  = (subject: ConceptId, rss: RelationSet[]): Relation[] =>
  rss
    .flatMap(unpackRelationSet)
    .map(r => ({...r, subject}));

export const unpackRelationSet = (rs: RelationSet): RelationWithOutSubject[] =>
  rs.objects
    .map(rso => ({
      predicate: {type: rs.relation.type, id: rs.relation.id},
      object: {type: rso.type, id: rso.id}
    }));

export const packRelationSets = (relations: Relation[]|RelationWithOutSubject[]): RelationSet[] => {
  return relations
    .reduce(
      (agg: RelationSet[], r: Relation|RelationWithOutSubject): RelationSet[] => {
        const rso: RelationSetObject = {
          id: r.object.id,
          type: r.object.type
        };
        const entryIndex = agg
          .findIndex((rs: RelationSet): boolean => rs.relation.id === r.predicate.id && rs.relation.type === r.predicate.type);
        if (entryIndex > -1) {
          agg[entryIndex].objects.push(rso);
        } else {
          agg.push({
            objects: [rso],
            relation: r.predicate
          })
        }
        return agg;
      },
      <RelationSet[]>[]
    );
};
