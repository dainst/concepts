import {SqlCommand} from '../interfaces/sql';

export const deleteSql = {
  label: (labelId: string): SqlCommand => [`delete from labels where id = $1`, labelId]
};
