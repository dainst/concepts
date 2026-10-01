// generated with script/creates-typeguards.ts

import {Domain} from '../interfaces/domain';
import {isConceptId} from './concept.typeguards';

export const isDomain = (thing: unknown): thing is Domain =>
  (typeof thing === 'object')
	&& (thing != null)
	&& ('id' in thing)
	&& (typeof thing.id === 'string')
	&& ('root' in thing)
	&& ((isConceptId(thing.root)) || (thing.root == null))
	&& ((!('subDomains' in thing)) || ('subDomains' in thing && Array.isArray(thing.subDomains) && thing.subDomains.every(isDomain)))
