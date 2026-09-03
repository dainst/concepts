import {GraphColorProfile, GraphExpansionProfile} from '../../interfaces/graph';

// TODO respect concept types
export const graphExpansionProfiles: {[id: string]: GraphExpansionProfile} = {
  normal: {
    hasPeriodType: 1,
    contains: 0,
    related: 1,
    isNamesAfter: 1,
    isListedIn: 1,
    isSimilarTo: 1,
    lists: 0,
    narrower: 2,
    broader: 2,
    exactMatch: 5,
    isSenseOf: 5,
    __default: 3
  },
  full: {
    __default: 200
  }
}

export const graphColorProfiles: {[id: string]: GraphColorProfile} = {
  none: {
    colorizeNodesBy: 'none'
  },
  types: {
    colorizeNodesBy: 'type'
  },
  distance: {
    colorizeNodesBy: 'distance'
  },
  domain: {
    colorizeNodesBy: 'domain'
  },
}
