// layout group
// see more/truncate
REST API

1. fetch-category-parent=>categories

GRAPHQL API

1. "ChangePasswordInput". Did you mean "changePasswordInput",
2. "ForgetPasswordInput". Did you mean "forgetPasswordInput",
3. "ResetPasswordInput". Did you mean "resetPasswordInput",
4. "VerifyForgetPasswordTokenInput". Did you mean "verifyForgetPasswordTokenInput"
5. contact=>contactUs
   6."$customer_id" of type "ID" used in position expecting type "Int".
6. "$shop_id" of type "ID" used in position expecting type "Int"

NOTE: only for windows user ( if you want to use GraphQL version)

- Go to your specific project root and find `.graphql-let.yml`
- Replace the env variable `${NEXT_PUBLIC_GRAPHQL_API_ENDPOINT}` in schema field manually
- Provide your API url in the schema field.
- Also change the dev command at `package.json`
- Go to `package.json` file and change the scripts:

"node -r dotenv/config $(yarn bin)/graphql-let",
to
"codegen": "graphql-let",
