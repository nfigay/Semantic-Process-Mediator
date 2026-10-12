import { afterEach, describe, expect, it, vi } from 'vitest';
import { createFileInput } from './file-input.js';

async function settleCall(call) {
  try { return { status: 'fulfilled', value: await call() }; }
  catch (reason) { return { status: 'rejected', reason }; }
}

function arrange(handler) {
  let change;
  let reader;
  const input = {
    files: [{ name: 'sample.bpmn' }],
    value: 'selected',
    addEventListener: vi.fn((name, callback) => {
      if (name === 'change') change = callback;
    }),
    click: vi.fn(),
  };
  vi.stubGlobal('document', {
    getElementById: vi.fn(() => input),
    createElement: vi.fn(),
    body: { appendChild: vi.fn() },
  });
  class Reader {
    constructor() { reader = this; }
    readAsText = vi.fn();
  }
  vi.stubGlobal('FileReader', Reader);
  const api = createFileInput({ id: 'test-input', onLoad: handler });
  const file = input.files[0];
  change();
  return { api, input, file, reader };
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('CODEX-05A FileReader callback produced by createFileInput', () => {
  it.each(['synchronous', 'asynchronous'])(
    'forwards exact arguments and completes %s success',
    async style => {
      const handler = style === 'synchronous'
        ? vi.fn(() => 'unused result')
        : vi.fn(async () => 'unused result');
      const h = arrange(handler);
      const result = await settleCall(
        () => h.reader.onload({ target: { result: '<definitions/>' } }),
      );
      expect(result.status).toBe('fulfilled');
      expect(handler).toHaveBeenCalledExactlyOnceWith('<definitions/>', h.file);
      expect(h.reader.readAsText).toHaveBeenCalledExactlyOnceWith(h.file);
      expect(h.input.value).toBe('');
    },
  );

  it('awaits the actual asynchronous handler rather than completing early', async () => {
    let release;
    const deferred = new Promise(resolve => { release = resolve; });
    const handler = vi.fn(() => deferred);
    const h = arrange(handler);
    const returned = h.reader.onload({ target: { result: 'xml' } });
    let completed = false;
    const observed = Promise.resolve(returned).then(() => { completed = true; });
    await Promise.resolve();
    expect.soft(returned instanceof Promise).toBe(true);
    expect.soft(completed).toBe(false);
    release();
    await observed;
    expect(completed).toBe(true);
  });

  it.each(['synchronous', 'asynchronous'])(
    'consumes %s handler rejection at the terminal callback',
    async style => {
      const sentinel = new Error('handler rejected');
      // Observe this dependency promise as well, so the pre-fix runner does not
      // receive an unrelated unhandled rejection merely because it ignores it.
      const rejected = Promise.reject(sentinel);
      rejected.catch(() => {});
      const handler = style === 'synchronous'
        ? vi.fn(() => { throw sentinel; })
        : vi.fn(() => rejected);
      const alert = vi.fn();
      vi.stubGlobal('alert', alert);
      const logger = vi.spyOn(console, 'error').mockImplementation(() => {});
      const h = arrange(handler);
      const result = await settleCall(() => h.reader.onload({ target: { result: 'xml' } }));
      expect.soft(result.status).toBe('fulfilled');
      expect.soft(handler).toHaveBeenCalledExactlyOnceWith('xml', h.file);
      expect.soft(logger).toHaveBeenCalledExactlyOnceWith('[File Load Failed]', sentinel);
      expect.soft(alert).not.toHaveBeenCalled();
    },
  );

  it('does not produce a second alert after an already-reported load rejection', async () => {
    const sentinel = new Error('already reported');
    const alert = vi.fn();
    vi.stubGlobal('alert', alert);
    const rejected = Promise.reject(sentinel);
    rejected.catch(() => {});
    const handler = vi.fn(() => {
      alert('Unable to import BPMN diagram');
      return rejected;
    });
    const logger = vi.spyOn(console, 'error').mockImplementation(() => {});
    const h = arrange(handler);
    const result = await settleCall(() => h.reader.onload({ target: { result: 'xml' } }));
    expect.soft(result.status).toBe('fulfilled');
    expect.soft(alert).toHaveBeenCalledTimes(1);
    expect.soft(logger).toHaveBeenCalledExactlyOnceWith('[File Load Failed]', sentinel);
  });

  it('consumes the original failure even when terminal logging throws', async () => {
    const sentinel = new Error('handler rejected');
    const h = arrange(() => { throw sentinel; });
    vi.spyOn(console, 'error').mockImplementation(() => { throw new Error('logger'); });
    const result = await settleCall(() => h.reader.onload({ target: { result: 'xml' } }));
    expect(result.status).toBe('fulfilled');
  });

  it('uses the latest handler installed through setOnLoad', async () => {
    const old = vi.fn();
    const current = vi.fn();
    const h = arrange(old);
    h.api.setOnLoad(current);
    await settleCall(() => h.reader.onload({ target: { result: 'xml' } }));
    expect(old).not.toHaveBeenCalled();
    expect(current).toHaveBeenCalledExactlyOnceWith('xml', h.file);
  });
});
