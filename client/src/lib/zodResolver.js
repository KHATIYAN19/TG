import { toNestErrors, validateFieldsNatively } from "@hookform/resolvers";
import { appendErrors } from "react-hook-form";

/**
 * Format Zod validation issues into the flat errors structure expected by React Hook Form.
 * Compatible with both Zod v3 (issue.unionErrors[].errors) and Zod v4 (issue.issues / issue.unionErrors[].issues).
 */
function parseErrorIssues(issues, criteriaModeAll) {
  const errors = {};
  for (let i = 0; i < issues.length; i++) {
    const issue = issues[i];
    const path = Array.isArray(issue.path) ? issue.path.join(".") : (issue.path || "");

    if (!errors[path]) {
      if (issue.unionErrors) {
        const first =
          issue.unionErrors[0]?.issues?.[0] || issue.unionErrors[0]?.errors?.[0];
        if (first) {
          errors[path] = { message: first.message, type: first.code };
        }
      } else {
        errors[path] = { message: issue.message, type: issue.code };
      }
    }

    if (issue.unionErrors) {
      for (const unionError of issue.unionErrors) {
        const uIssues = unionError.issues || unionError.errors || [];
        for (const uIssue of uIssues) {
          issues.push(uIssue);
        }
      }
    }

    if (criteriaModeAll) {
      const types = errors[path]?.types;
      const current = types && types[issue.code];
      errors[path] = appendErrors(
        path,
        criteriaModeAll,
        errors,
        issue.code,
        current ? [].concat(current, issue.message) : issue.message
      );
    }
  }
  return errors;
}

/**
 * Custom zodResolver that supports both Zod v3 and Zod v4.
 * In Zod v4, ZodError has `.issues` while `.errors` is undefined.
 * The standard @hookform/resolvers/zod v5.0.1 checks Array.isArray(error?.errors),
 * which fails on Zod v4 and throws Uncaught (in promise) ZodError.
 */
export const zodResolver = (schema, schemaOptions, resolverOptions = {}) => {
  return async (values, context, options = {}) => {
    try {
      const parseMethod =
        resolverOptions.mode === "sync" ? "parse" : "parseAsync";
      const data = await schema[parseMethod](values, schemaOptions);

      if (options.shouldUseNativeValidation) {
        validateFieldsNatively({}, options);
      }

      return {
        values: resolverOptions.raw ? Object.assign({}, values) : data,
        errors: {},
      };
    } catch (error) {
      const issues = Array.isArray(error?.issues)
        ? error.issues
        : Array.isArray(error?.errors)
        ? error.errors
        : null;

      if (issues) {
        return {
          values: {},
          errors: toNestErrors(
            parseErrorIssues(
              [...issues],
              !options.shouldUseNativeValidation &&
                options.criteriaMode === "all"
            ),
            options
          ),
        };
      }

      throw error;
    }
  };
};

export default zodResolver;
