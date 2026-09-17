import {Concept, GeographicalExtend, Label} from 'common/interfaces/concept';
import {getIssues} from '@placemarkio/check-geojson';

const checkMax = (max: number) => (value: number): string | null =>
  value > max ? `must be > ${max}` : null;

const checkMin = (min: number) => (value: number): string | null =>
  value < min ? `must be > ${min}` : null;

const checkInt = (value: number): string | null =>
  Math.floor(value) !== value ? 'must be an integer' : null;

const check = <T>(name: string, value: T, checks: Array<(v: T) => string|null>): string[] =>
  checks
    .map(check => check(value))
    .filter(e => e != null)
    .map(i => `[${name}] ${i}`)

const checkPoint = (name: string, pointStr: string): string[] => {
  const issues = getIssues(pointStr)
  if (issues.length) return issues.map(i => `[${name}] ${i.message}`);
  const point = JSON.parse(pointStr);
  if (!('type' in point)) return [`[${name}] invalid point string (GeoJSON)`];
  if (point.type !== 'Point') return [`[${name}] for center only point is allowed`];
  return [];
};

const checkLength = (length: number) => (value: string): string | null =>
    value.length !== length ? `must be ${length} characters long` : null;

export const validateGeographicalExtends = (ge: GeographicalExtend): string[] => [
  ...checkPoint('center', ge.center),
  ...check('certainty', ge.certainty, [
    checkInt,
    checkMin(0),
    checkMax(100)
  ]),
  ...check('precision', ge.precision, [
    checkInt,
    checkMin(0),
    checkMax(100)
  ]),
  ...(ge.shape ? getIssues(ge.shape).map(i => `[shape] ${i.message}`) : []),
];

export const validateLabel = (label: Label): string[] => [
  ...check('language', label.language, [
    checkLength(3)
  ])
];

export const validateConcept = (c: Concept): string[] => [
  ...(c.geographicalExtends || []).flatMap(validateGeographicalExtends),
  ...(c.labels || []).flatMap(validateLabel)
];
