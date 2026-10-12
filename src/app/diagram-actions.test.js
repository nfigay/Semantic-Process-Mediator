import { afterEach, describe, expect, it, vi } from 'vitest';
import { createDiagramActions } from './diagram-actions.js';
import { importBpmn } from '../bpmn/io.js';

const XML = '<definitions/>';
async function settle(call) {
  try { return { status: 'fulfilled', value: await call() }; }
  catch (reason) { return { status: 'rejected', reason }; }
}

function arrange({ xmlError = null, failedStage = null, fallback = false } = {}) {
  const events = [];
  const peripheralError = new Error('peripheral failure');
  function stage(name, result) {
    return vi.fn(() => {
      events.push(name);
      if (name === failedStage) throw peripheralError;
      return result;
    });
  }
  const context = { cocOwner: 'owner', maturity: 'L3' };
  const layout = {};
  const zoom = stage('zoom');
  const modeler = {
    importXML: vi.fn(async () => {
      events.push('import');
      if (xmlError) throw xmlError;
      return { warnings: [] };
    }),
    get: vi.fn(name => {
      if (name !== 'canvas') throw new Error('Unexpected service: ' + name);
      if (failedStage === 'canvas') throw peripheralError;
      return { zoom };
    }),
  };
  const extractPalette = stage('palette');
  const readRepositoryContext = stage('context', context);
  const applyLintContext = stage('apply');
  const linter = {
    run: stage('lint'),
    setCoc: stage('setCoc'),
    setProfile: stage('setProfile'),
  };
  const alert = vi.fn();
  const logger = vi.spyOn(console, 'error').mockImplementation(() => {});
  const actions = createDiagramActions({
    modeler, layout, linter, importBpmn, extractPalette,
    readRepositoryContext,
    applyLintContext: fallback ? undefined : applyLintContext,
    alert,
  });
  return {
    actions, events, context, layout, zoom, modeler,
    extractPalette, readRepositoryContext, applyLintContext,
    linter, alert, logger, peripheralError,
  };
}

afterEach(() => vi.restoreAllMocks());

describe('CODEX-05A loadDiagram — actual XML / peripheral composition', () => {
  it('rejects with XML identity and stops every downstream operation', async () => {
    const sentinel = new Error('XML sentinel');
    const h = arrange({ xmlError: sentinel });
    const result = await settle(() => h.actions.loadDiagram(XML));
    expect.soft(result.status).toBe('rejected');
    expect.soft(result.reason).toBe(sentinel);
    expect.soft(h.events).toEqual(['import']);
    expect.soft(h.modeler.get).not.toHaveBeenCalled();
    expect.soft(h.zoom).not.toHaveBeenCalled();
    expect.soft(h.extractPalette).not.toHaveBeenCalled();
    expect.soft(h.readRepositoryContext).not.toHaveBeenCalled();
    expect.soft(h.applyLintContext).not.toHaveBeenCalled();
    expect.soft(h.linter.run).not.toHaveBeenCalled();
    expect.soft(h.logger).toHaveBeenCalledExactlyOnceWith('loadDiagram error:', sentinel);
    expect.soft(h.alert).toHaveBeenCalledExactlyOnceWith('Unable to import BPMN diagram');
  });

  it.each(['console.error', 'alert'])(
    'preserves XML rejection when %s throws synchronously',
    async reportingStage => {
      const sentinel = new Error('XML sentinel');
      const reportingError = new Error('reporting sentinel');
      const h = arrange({ xmlError: sentinel });
      (reportingStage === 'console.error' ? h.logger : h.alert)
        .mockImplementation(() => { throw reportingError; });
      const result = await settle(() => h.actions.loadDiagram(XML));
      expect.soft(result.status).toBe('rejected');
      expect.soft(result.reason).toBe(sentinel);
      expect.soft(h.events).toEqual(['import']);
      expect.soft(h.modeler.get).not.toHaveBeenCalled();
      if (reportingStage === 'console.error') {
        expect.soft(h.alert).not.toHaveBeenCalled();
      } else {
        expect.soft(h.alert).toHaveBeenCalledTimes(1);
      }
    },
  );

  it('keeps import → zoom → palette → context → lint order and arguments', async () => {
    const h = arrange();
    await expect(h.actions.loadDiagram(XML)).resolves.toBeUndefined();
    expect(h.events).toEqual(['import', 'zoom', 'palette', 'context', 'apply', 'lint']);
    expect(h.modeler.importXML).toHaveBeenCalledExactlyOnceWith(XML);
    expect(h.modeler.get).toHaveBeenCalledExactlyOnceWith('canvas');
    expect(h.zoom).toHaveBeenCalledExactlyOnceWith('fit-viewport');
    expect(h.extractPalette).toHaveBeenCalledExactlyOnceWith({ layout: h.layout });
    expect(h.readRepositoryContext).toHaveBeenCalledExactlyOnceWith();
    expect(h.applyLintContext).toHaveBeenCalledExactlyOnceWith(h.context);
    expect(h.linter.run).toHaveBeenCalledExactlyOnceWith();
    expect(h.linter.setCoc).not.toHaveBeenCalled();
    expect(h.linter.setProfile).not.toHaveBeenCalled();
    expect(h.alert).not.toHaveBeenCalled();
    expect(h.logger).not.toHaveBeenCalled();
  });

  it('preserves the existing fallback lint context path', async () => {
    const h = arrange({ fallback: true });
    await expect(h.actions.loadDiagram(XML)).resolves.toBeUndefined();
    expect(h.events).toEqual(['import', 'zoom', 'palette', 'context', 'setCoc', 'setProfile', 'lint']);
    expect(h.linter.setCoc).toHaveBeenCalledExactlyOnceWith('owner');
    expect(h.linter.setProfile).toHaveBeenCalledExactlyOnceWith('L3');
    expect(h.applyLintContext).not.toHaveBeenCalled();
  });

  it.each([
    ['canvas', []],
    ['zoom', ['zoom']],
    ['palette', ['zoom', 'palette']],
    ['context', ['zoom', 'palette', 'context']],
    ['apply', ['zoom', 'palette', 'context', 'apply']],
    ['lint', ['zoom', 'palette', 'context', 'apply', 'lint']],
    ['setCoc', ['zoom', 'palette', 'context', 'setCoc']],
    ['setProfile', ['zoom', 'palette', 'context', 'setCoc', 'setProfile']],
  ])('keeps post-import %s failure observable through existing reporting', async (failedStage, prefix) => {
    const h = arrange({
      failedStage,
      fallback: ['setCoc', 'setProfile'].includes(failedStage),
    });
    const result = await settle(() => h.actions.loadDiagram(XML));
    expect.soft(result.status).toBe('fulfilled');
    expect.soft(h.events).toEqual(['import', ...prefix]);
    expect.soft(h.logger).toHaveBeenCalledExactlyOnceWith('loadDiagram error:', h.peripheralError);
    expect.soft(h.alert).toHaveBeenCalledExactlyOnceWith('Unable to import BPMN diagram');
  });

  it.each(['console.error', 'alert'])(
    'preserves the existing post-import rejection if %s itself throws',
    async reportingStage => {
      const h = arrange({ failedStage: 'palette' });
      const reportingError = new Error('reporting sentinel');
      (reportingStage === 'console.error' ? h.logger : h.alert)
        .mockImplementation(() => { throw reportingError; });
      const result = await settle(() => h.actions.loadDiagram(XML));
      expect.soft(result.status).toBe('rejected');
      expect.soft(result.reason).toBe(reportingError);
      expect.soft(h.modeler.importXML).toHaveBeenCalledTimes(1);
      expect.soft(h.events).toEqual(['import', 'zoom', 'palette']);
    },
  );
});
