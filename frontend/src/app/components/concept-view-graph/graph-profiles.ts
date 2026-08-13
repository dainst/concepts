import {GraphColorProfile, GraphExpansionProfile} from '../../interfaces/graph';

export const graphExpansionProfiles: {[id: string]: GraphExpansionProfile} = {
  normal: {
    backward: {
      hasPeriodType: 0,
      // broader: 0
    },
    forward: {
      hasPeriodType: 1,
      contains: 0,
      related: 1,
      isNamesAfter: 1,
      isSimilarTo: 1
    },
    default: {
      forward: 10,
      backward: 10
    }
  },
  full: {
    backward: {},
    forward: {},
    default: {
      forward: 20,
      backward: 20
    }
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
