import {LabelType, labelTypes, PreferredLabels} from '../interfaces/concept';

export const isLabelType = (thing: unknown): thing is LabelType =>
  (typeof thing === 'string') && (labelTypes as readonly string[]).includes(thing);

export const isPreferredLabels = (thing: unknown): thing is PreferredLabels =>
  (typeof thing === 'object')
  && (thing != null)
  && Object.entries(thing)
    .every(([key, val]) => (!isLabelType(key) || typeof val == 'string'));
