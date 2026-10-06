// generated with script/creates-typeguards.ts

import {User} from '../interfaces/user';

export const isUser = (thing: unknown): thing is User =>
  (typeof thing === 'object')
	&& (thing != null)
	&& ('id' in thing)
	&& (typeof thing.id === 'string')
	&& ('username' in thing)
	&& (typeof thing.username === 'string')
	&& ('name' in thing)
	&& (typeof thing.name === 'string')
	&& ('email' in thing)
	&& (typeof thing.email === 'string')
	&& ('groups' in thing)
	&& (Array.isArray(thing.groups))
	&& (thing.groups.every(e => typeof e === 'string'))
	&& ('roles' in thing)
	&& (Array.isArray(thing.roles))
	&& (thing.roles.every(e => typeof e === 'string'))
