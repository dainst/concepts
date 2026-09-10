export const conceptViews = [
  'map',
  'timeline',
  'graph',
  'history',
  'raw',
  'edit'
] as const;

export type View = typeof conceptViews[number];


export type ViewMap<T> = {
  [type in View]: T;
};


