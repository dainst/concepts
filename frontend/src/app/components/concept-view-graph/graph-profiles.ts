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
    __default: 10
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
