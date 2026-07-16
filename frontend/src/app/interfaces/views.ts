export const conceptViews = [
  'map',
  'timeline',
  'raw'
] as const;

export type View = typeof conceptViews[number];


export type ViewMap<T> = {
  [type in View]: T;
};


