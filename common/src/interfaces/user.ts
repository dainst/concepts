export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  groups: string[];
  roles: string[];
  preferredLanguage: string;
}
