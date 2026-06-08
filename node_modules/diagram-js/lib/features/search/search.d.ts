/**
 * Search items by query.
 *
 *
 * @param items elements to search in
 * @param pattern pattern to search for
 * @param options
 *
 * @returns
 */
export default function search<T extends SearchItem>(
  items: T[],
  pattern: string,
  options: {
      keys: string[];
  }
): SearchResult<T>[];
export type BaseToken = {
    index: number;
    value: string;
    match?: boolean;
    start?: boolean;
    end?: boolean;
    wordStart?: boolean;
    wordEnd?: boolean;
    all?: boolean;
};
export type Token = BaseToken | BaseToken[];
export type SearchResult<R> = {
    item: R;
    tokens: Record<string, Token[]>;
};
export type SearchItem = Record<string, string | string[]>;
