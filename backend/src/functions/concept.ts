import {Concept, Relation} from 'common/interfaces/concept';
import {unpackRelationSets} from 'common/functions/relation-set';

type ConceptItem = {
  [K in keyof Concept]-?: NonNullable<Concept[K]> extends readonly unknown[] ? K : never
}[keyof Concept];

type ConceptItemType<K extends ConceptItem> = NonNullable<Concept[K]>[number];

export const getItemId = (thing: object): string =>
  ('id' in thing) ? String(thing.id) : '';

export const compareRelations = (r1: Relation, r2: Relation): boolean =>
  r1.subject.type == r2.subject.type
  && r1.subject.id == r2.subject.id
  && r1.predicate.type == r2.predicate.type
  && r1.predicate.id == r2.predicate.id
  && r1.object.type == r2.object.type
  && r1.object.id == r2.object.id;

export const conceptItemDiff = <T extends ConceptItem>(type: T, c1: Concept, c2: Concept): ConceptItemType<T>[] => {
  const itemList1: ConceptItemType<T>[] = (Array.isArray(c1[type]) ? c1[type] : []);
  const itemList2: ConceptItemType<T>[] = (Array.isArray(c2[type]) ? c2[type] : []);
  return itemList1
    .filter(itemInC1 => !itemList2.find(itemInC2 => getItemId(itemInC1) === getItemId(itemInC2)));
};

export const relationsDiff = (c1: Concept, c2: Concept): Relation[] => {
  const itemList1= unpackRelationSets(c1.id, c1.relations || []);
  const itemList2= unpackRelationSets(c2.id, c2.relations || []);
  return itemList1
    .filter(itemInC1 => !itemList2.find(itemInC2 => compareRelations(itemInC1, itemInC2)));
}
