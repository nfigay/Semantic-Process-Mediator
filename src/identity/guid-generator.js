/*
 * ------------------------------------------------------------
 * SemArch GUID Generator
 * ------------------------------------------------------------
 *
 * SemArch uses a canonical UUID as a persistent identity.
 *
 * This identity is independent from:
 *
 * - BPMN XML IDs
 * - repository runtime IDs
 * - Sparx EA GUID representation
 * - ARIS identifiers
 * - any future modeling platform
 *
 * Platform-specific representations belong in platform adapters,
 * not in this module.
 * ------------------------------------------------------------
 */


/*
 * ------------------------------------------------------------
 * UUID validation
 * ------------------------------------------------------------
 */

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i


/*
 * ------------------------------------------------------------
 * Create GUID
 * ------------------------------------------------------------
 */

export function createGuid() {

  if (
    globalThis.crypto
    && typeof globalThis.crypto.randomUUID === 'function'
  ) {

    return globalThis.crypto
      .randomUUID()
      .toLowerCase()
  }


  /*
   * Fallback for environments where randomUUID()
   * is unavailable but crypto.getRandomValues()
   * exists.
   */

  if (
    globalThis.crypto
    && typeof globalThis.crypto.getRandomValues === 'function'
  ) {

    const bytes =
      new Uint8Array(
        16
      )


    globalThis.crypto
      .getRandomValues(
        bytes
      )


    /*
     * UUID version 4
     */

    bytes[6] =
      (
        bytes[6]
        & 0x0f
      )
      | 0x40


    /*
     * RFC 4122 variant
     */

    bytes[8] =
      (
        bytes[8]
        & 0x3f
      )
      | 0x80


    const hex =
      Array
        .from(
          bytes,
          value =>
            value
              .toString(
                16
              )
              .padStart(
                2,
                '0'
              )
        )


    return [
      hex
        .slice(
          0,
          4
        )
        .join(
          ''
        ),

      hex
        .slice(
          4,
          6
        )
        .join(
          ''
        ),

      hex
        .slice(
          6,
          8
        )
        .join(
          ''
        ),

      hex
        .slice(
          8,
          10
        )
        .join(
          ''
        ),

      hex
        .slice(
          10,
          16
        )
        .join(
          ''
        )
    ]
      .join(
        '-'
      )
  }


  throw new Error(
    'Secure GUID generation is not available in this environment.'
  )
}


/*
 * ------------------------------------------------------------
 * GUID validation
 * ------------------------------------------------------------
 */

export function isGuid(
  value
) {

  return (
    typeof value === 'string'
    && UUID_PATTERN.test(
      value
    )
  )
}


/*
 * ------------------------------------------------------------
 * GUID normalization
 * ------------------------------------------------------------
 *
 * SemArch canonical representation:
 *
 * 550e8400-e29b-41d4-a716-446655440000
 *
 * No braces.
 * Lowercase.
 * ------------------------------------------------------------
 */

export function normalizeGuid(
  value
) {

  if (
    typeof value !== 'string'
  ) {

    return null
  }


  const normalized =
    value
      .trim()
      .replace(
        /^\{/,
        ''
      )
      .replace(
        /\}$/,
        ''
      )
      .toLowerCase()


  if (
    !isGuid(
      normalized
    )
  ) {

    return null
  }


  return normalized
}