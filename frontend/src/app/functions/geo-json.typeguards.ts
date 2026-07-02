import * as geojson from "geojson";

export const geoJSONGeometryTypes = [
 "Feature", "Point", "MultiPoint",
  "LineString", "MultiLineString", "Polygon",
  "MultiPolygon", "GeometryCollection", "FeatureCollection"
] as const;

export type GeoJSONGeometryType = typeof geoJSONGeometryTypes[number];

export const isGeoJSONGeometryType =  (thing: unknown): thing is GeoJSONGeometryType =>
  (typeof thing === 'string') && (geoJSONGeometryTypes as readonly string[]).includes(thing);

export const isGeoJsonObject =  (thing: unknown): thing is geojson.GeoJsonObject =>
  (typeof thing === 'object') && (thing != null)
  && ('type' in thing) && isGeoJSONGeometryType(thing.type)
  && ('coordinates' in thing);
