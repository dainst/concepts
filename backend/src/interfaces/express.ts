import {User} from 'common/interfaces/user';

declare global {
  namespace Express {
    interface Request {
      user: User | null;
    }
  }
}
