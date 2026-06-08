import { Tree } from '@lezer/common';
export type ParseContext = Record<string, unknown>;
export declare function parseExpression(expression: string, context: ParseContext, dialect: string | undefined): Tree;
export declare function parseUnaryTests(expression: string, context: ParseContext, dialect: string | undefined): Tree;
