import {User} from 'common/interfaces/user';
import {JWTPayload} from 'jose';


export const fromToken = (token: JWTPayload): User => {
  const getStringField = (field: string): string => {
    if (!(field in token))
      throw new Error(`Token Error: ${field} is missing`);
    if (typeof token[field] !== 'string')
      throw new Error(`Token Error: ${field} is no string`);
    return token[field];
  };
  const getStringArrayField = (field: string): string[] => {
    if (!(field in token))
      return []; // TODO handle groups missing
      // throw new Error(`Token Error: ${field} is missing`);
    if (!Array.isArray(token[field]))
      throw new Error(`Token Error: ${field} is no array`);
    if (!token[field].every(f => typeof f === 'string'))
      throw new Error(`Token Error: ${field} is no string array`);
    return token[field];
  };

  const roles =
    'realm_access' in token
    && token['realm_access']
    && typeof token['realm_access'] === 'object'
    && token['realm_access'] != null
    && 'roles' in token['realm_access']
    && Array.isArray(token['realm_access'].roles)
    && token['realm_access'].roles.every(f => typeof f === 'string')
      ? token['realm_access'].roles
      : []; // TODO handle realm access missing
  // if (!roles) throw new Error(`Token Error: field realm_access is missing`);

  return {
    id: getStringField('sub'),
    username: getStringField('preferred_username'),
    name: getStringField('name'),
    email: getStringField('email'),
    groups: getStringArrayField('groups'),
    roles
  };
};
