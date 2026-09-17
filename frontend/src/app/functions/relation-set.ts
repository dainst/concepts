import {Relation, RelationSet, RelationSetObject} from 'concepts-common/interfaces/concept';

export const unpackRelationSet = (rs: RelationSet): Relation[] =>
  rs.objects
    .map(rso => ({
      predicate: {type: rs.relation.type, id: rs.relation.id},
      object: {type: rso.type, id: rso.id},
      ...{id: rso.relationId ? rso.relationId : undefined}
    }));

export const packRelationSets = (relations: Relation[]): RelationSet[] => {
  return relations
    .reduce(
      (agg: RelationSet[], r: Relation): RelationSet[] => {
        const rso: RelationSetObject = {
          id: r.object.id,
          relationId: r.id,
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
