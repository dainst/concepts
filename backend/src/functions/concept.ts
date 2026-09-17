import {Concept} from 'common/interfaces/concept';

type ConceptItem = {
  [K in keyof Concept]-?: NonNullable<Concept[K]> extends readonly unknown[] ? K : never
}[keyof Concept];

type ConceptItemType<K extends ConceptItem> = NonNullable<Concept[K]>[number];

export const getItemId = (thing: object): string =>
  ('id' in thing) ? String(thing.id) : '';

export const conceptItemDiff = <T extends ConceptItem>(type: T, c1: Concept, c2: Concept): ConceptItemType<T>[] => {
  const itemList1: ConceptItemType<T>[] = (Array.isArray(c1[type]) ? c1[type] : []);
  const itemList2: ConceptItemType<T>[] = (Array.isArray(c2[type]) ? c2[type] : []);
  return itemList1
    .filter(
      itemInC1 => !itemList2.find(itemInC2 => getItemId(itemInC1) === getItemId(itemInC2))
    );
};
