import { describe, expect, it, vi } from 'vitest';
import { importBpmn } from './io.js';

describe('CODEX-05A importBpmn — XML boundary', () => {
  it('propagates the exact XML rejection without accessing canvas', async () => {
    const sentinel = new Error('XML rejected');
    const modeler = {
      importXML: vi.fn().mockRejectedValue(sentinel),
      get: vi.fn(),
    };
    await expect(importBpmn(modeler, '<definitions/>')).rejects.toBe(sentinel);
    expect(modeler.importXML).toHaveBeenCalledExactlyOnceWith('<definitions/>');
    expect(modeler.get).not.toHaveBeenCalled();
  });

  it('completes successful XML import without owning zoom', async () => {
    const zoom = vi.fn();
    const modeler = {
      importXML: vi.fn().mockResolvedValue({ warnings: [] }),
      get: vi.fn(() => ({ zoom })),
    };
    await expect(importBpmn(modeler, '<definitions/>')).resolves.toBeUndefined();
    expect(modeler.importXML).toHaveBeenCalledExactlyOnceWith('<definitions/>');
    expect(modeler.get).not.toHaveBeenCalled();
    expect(zoom).not.toHaveBeenCalled();
  });
});
