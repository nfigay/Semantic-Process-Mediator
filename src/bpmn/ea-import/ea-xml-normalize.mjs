/** Browser-native equivalent of EA-XSLT-15N/normalize.js: decode bytes, preserve XML, update declaration. */
export function normalizeEaBytes(bytes) {
  if (!(bytes instanceof ArrayBuffer) && !ArrayBuffer.isView(bytes)) throw new TypeError('Expected ArrayBuffer or typed array');
  const data = bytes instanceof ArrayBuffer ? new Uint8Array(bytes) : new Uint8Array(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const head = Array.from(data.subarray(0, 256), b => String.fromCharCode(b)).join('');
  const declared = (head.match(/encoding\s*=\s*['"]([^'"]+)['"]/i) || [])[1] || 'utf-8';
  if (!/^(windows-1252|cp1252|utf-8|utf8)$/i.test(declared)) throw new Error('UNSUPPORTED_ENCODING=' + declared);
  const encoding = /^(windows-1252|cp1252)$/i.test(declared) ? 'windows-1252' : 'utf-8';
  const xml = new TextDecoder(encoding, { fatal: true }).decode(data)
    .replace(/(<\?xml[^>]*encoding\s*=\s*['"])[^'"]+(['"])/i, '$1UTF-8$2');
  return { xml, sourceEncoding: declared };
}
