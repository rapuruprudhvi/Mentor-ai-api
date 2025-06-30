import { z } from "zod";

const ulidRegex = /^[0123456789ABCDEFGHJKMNPQRSTVWXYZ]{26}$/;

export const UlidIdSchema = z
  .string()
  .refine((value) => ulidRegex.test(value), {
    message: "Invalid ULID",
  });

