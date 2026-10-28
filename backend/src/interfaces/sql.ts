export type SqlCommandParams = Array<string | boolean | number | null>;
export type SqlCommand = [string, ...SqlCommandParams];
export type SqlCommandWithId = [string, string, ...SqlCommandParams];

const s: SqlCommand = ['A' , 1 , 2];
