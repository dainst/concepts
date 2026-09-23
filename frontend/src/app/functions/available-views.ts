import {Concept} from 'concepts-common/interfaces/concept';
import {View} from '../interfaces/views';
import {
  isGeographicalConcept,
  isRelatedConcept,
  isTemporalConcept
} from 'concepts-common/functions/concept.typeguards';

export const getAvailableViews = (concept: Concept|undefined): View[] => {
  if (!concept) return [];
  const views: View[] = [];
  if (isGeographicalConcept(concept)) views.push('map');
  if (isTemporalConcept(concept)) views.push('timeline');
  if (isRelatedConcept(concept)) views.push('graph');
  views.push('raw', 'history', 'edit');
  return views;
};
