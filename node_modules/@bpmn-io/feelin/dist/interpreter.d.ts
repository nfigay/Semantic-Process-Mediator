export type WarningType = 'NO_VARIABLE_FOUND' | 'NO_CONTEXT_ENTRY_FOUND' | 'NO_PROPERTY_FOUND' | 'NOT_COMPARABLE' | 'INVALID_TYPE' | 'NO_FUNCTION_FOUND' | 'FUNCTION_INVOCATION_FAILURE';
export type SourceLocation = {
    from: number;
    to: number;
};
export type Warning = {
    type: WarningType;
    message: string;
    position: SourceLocation;
    details: {
        template: string;
        values: Record<string, unknown>;
    };
};
export type EvaluationResult<T> = {
    value: T;
    warnings: Warning[];
};
/**
 * Context passed to the interpreter as global variables.
 */
export type EvalContext = Record<string, unknown>;
export declare class SyntaxError extends Error {
    input: string;
    position: SourceLocation;
    constructor(message: string, details: {
        input: string;
        position: SourceLocation;
    });
}
export declare function unaryTest(expression: string, evalContext?: EvalContext, dialect?: string): EvaluationResult<boolean | null>;
export declare function evaluate(expression: string, evalContext?: EvalContext, dialect?: string): EvaluationResult<unknown>;
