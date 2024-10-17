/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import * as bcrypt from "bcrypt";

const saltRounds = 10;
export const hashPassword = (password: string): Promise<string> => {
  return bcrypt.hash(password, saltRounds).then(async (result) => {
    return result;
  });
};

export const verifyPassword = (
  password: string,
  hash: string,
): Promise<boolean> => {
  return bcrypt.compare(password, hash).then(async (result: boolean) => {
    return result;
  });
};
