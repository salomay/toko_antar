import * as yup from "yup";
export const customerValidationSchema = yup.object().shape({
  name: yup.string().required("form:error-name-required"),
  email: yup
    .string()
    .email("form:error-email-format")
    .required("form:error-email-required"),
  no_telp: yup.string().required("form:error-no_telp-required"),

});
