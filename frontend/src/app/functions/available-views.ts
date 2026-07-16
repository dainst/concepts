import {Concept} from 'concepts-common/src/interfaces/concept';
import {View, ViewMap, conceptViews} from '../interfaces/views';
import {isGeographicalConcept, isTemporalConcept} from 'concepts-common/src/functions/concept.typeguards';

export const availableViews = (concepts: Concept[]): ViewMap<number> =>
  concepts
    .reduce(
      (agg, concept) => {
        getAvailableViews(concept)
          .forEach(view => {
            if (!agg[view]) agg[view] = 0;
            agg[view]++;
          });
        return agg;
      },
      <ViewMap<number>>{}
    );

export const getAvailableViews = (concept: Concept|undefined): View[] => {
  if (!concept) return [];
  const views: View[] = ['raw'];
  if (isGeographicalConcept(concept)) views.push('map');
  if (isTemporalConcept(concept)) views.push('timeline');
  return views;
}
