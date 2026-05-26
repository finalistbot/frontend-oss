import { z, type ZodRawShape } from "zod";

export function readEnv<TShape extends ZodRawShape>(
  schemaShape: TShape,
  values: Record<keyof TShape, unknown>,
) {
  return z.object(schemaShape).parse(values);
}

export const urlEnv = z.string().url().transform((value) => value.replace(/\/$/, ""));
