/**
 * Collection of builtins of camunda scala FEEL.
 */
export const camundaBuiltins: Builtin[];

/**
 * List of standard FEEL built-in functions (excluding Camunda-specific extensions).
 */
export const feelBuiltins: Builtin[];

/**
 * List of FEEL camunda extensions.
 */
export const camundaExtensions: Builtin[];

/**
 * Camunda built-ins that use reserved keywords in their name and thus must
 * be explicitly declared when parsing FEEL.
 */
export const camundaReservedNameBuiltins: Builtin[];

export type Builtin = {
  /**
   * The name of the builtin function.
   */
  name: string;
  /**
   * A short description of the built-in function.
   */
  info: string;
  /**
   * Type of the builtin, always 'function' for builtin functions.
   */
  type?: 'function';
  /**
   * Function parameters.
   */
  params?: Array<{
    name: string;
  }>;
};
