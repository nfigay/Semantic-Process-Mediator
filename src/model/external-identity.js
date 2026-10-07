/*
 * ------------------------------------------------------------
 * BPMNSM External Identity
 *
 * Preserves an identity exactly as supplied by an external
 * source and links it to the canonical identity of its origin.
 *
 * The external value is deliberately opaque. BPMNSM does not
 * trim, normalize or reinterpret it here. Platform adapters may
 * derive an interpreted form separately without replacing the
 * source value.
 *
 * This abstraction is intentionally independent from:
 *
 * - Business Object attachment
 * - platform-specific GUID normalization
 * - repository persistence
 * - BPMN serialization
 * - UI
 * ------------------------------------------------------------
 */


export function createExternalIdentity({
  value,
  originRef
} = {}) {

  if (
    typeof value !==
      'string' ||
    value.length === 0
  ) {

    throw new Error(
      'ExternalIdentity requires a non-empty value'
    )
  }


  if (
    typeof originRef !==
      'string' ||
    !originRef.trim()
  ) {

    throw new Error(
      'ExternalIdentity requires a non-empty originRef'
    )
  }


  return Object.freeze({

    value,

    originRef:
      originRef.trim()
  })
}
