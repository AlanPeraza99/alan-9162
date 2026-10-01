import * as yup from "yup";

export const healthSchema = yup.object({
  status: yup.string().oneOf(["ok"]).required(),
});
