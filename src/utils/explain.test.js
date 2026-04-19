import { describe, it, expect } from 'vitest';
import { handFeatures, handDescriptor, actionRationale, explainQuestion } from './explain.js';

describe('handFeatures', () => {
  it('flags premium pairs (TT+)', () => {
    expect(handFeatures('AA').isPremiumPair).toBe(true);
    expect(handFeatures('TT').isPremiumPair).toBe(true);
    expect(handFeatures('99').isPremiumPair).toBe(false);
  });

  it('flags suited connectors with zero gap', () => {
    const f = handFeatures('76s');
    expect(f.isConnector).toBe(true);
    expect(f.isSuited).toBe(true);
    expect(f.gap).toBe(0);
  });

  it('flags suited wheel aces distinctly from suited big aces', () => {
    expect(handFeatures('A5s').isWheelAx).toBe(true);
    expect(handFeatures('AKs').isWheelAx).toBe(false);
    expect(handFeatures('AKs').isAx).toBe(true);
  });

  it('flags suited Broadway hands', () => {
    expect(handFeatures('KQs').isBroadway).toBe(true);
    expect(handFeatures('KQs').isSuited).toBe(true);
    expect(handFeatures('T9s').isBroadway).toBe(false); // 9 not broadway
  });
});

describe('handDescriptor', () => {
  it('mentions 6.5% flush probability for suited non-pair hands', () => {
    // The example in the feature request: "Suited cards give 6.5% flush probability plus …"
    expect(handDescriptor('76s')).toMatch(/6\.5%/);
    expect(handDescriptor('A5s')).toMatch(/6\.5%/);
    expect(handDescriptor('K8s')).toMatch(/6\.5%/);
  });

  it('does not credit offsuit hands with flush equity', () => {
    // Offsuit descriptors may note the *absence* of flush outs, but must not
    // claim the positive equity that suited hands get.
    expect(handDescriptor('AKo')).not.toMatch(/6\.5%/);
    expect(handDescriptor('AKo')).toMatch(/no flush outs/);
    expect(handDescriptor('72o')).not.toMatch(/6\.5%/);
  });

  it('describes premium pairs as dominating', () => {
    expect(handDescriptor('AA')).toMatch(/dominates/i);
  });

  it('mentions set-flop math for small pairs', () => {
    expect(handDescriptor('22')).toMatch(/set/i);
    expect(handDescriptor('22')).toMatch(/12%/);
  });
});

describe('actionRationale', () => {
  it('names the alternative action when correct is raise (RFI)', () => {
    const r = actionRationale({ type: 'rfi', heroPos: 'BTN', stackDepth: '100BB', correctAction: 'raise' });
    expect(r).toMatch(/fold/i);
  });

  it('names the alternative action when correct is fold (RFI)', () => {
    const r = actionRationale({ type: 'rfi', heroPos: 'UTG', stackDepth: '100BB', correctAction: 'fold' });
    expect(r).toMatch(/rais/i); // mentions why raising is wrong
  });

  it('mentions all three alternatives in vs-limp explanations', () => {
    const rRaise = actionRationale({ type: 'limp', heroPos: 'BTN', villainPos: 'UTG', stackDepth: '100BB', correctAction: 'raise' });
    expect(rRaise).toMatch(/limp/i);
    expect(rRaise).toMatch(/fold/i);

    const rCall = actionRationale({ type: 'limp', heroPos: 'BTN', villainPos: 'UTG', stackDepth: '100BB', correctAction: 'call' });
    expect(rCall).toMatch(/iso|raise/i);
    expect(rCall).toMatch(/fold/i);

    const rFold = actionRationale({ type: 'limp', heroPos: 'BTN', villainPos: 'UTG', stackDepth: '100BB', correctAction: 'fold' });
    expect(rFold).toMatch(/iso|call/i);
  });

  it('contrasts 3-bet vs call vs fold for vs-raise spots', () => {
    const r3b = actionRationale({ type: 'vsRaise', heroPos: 'BTN', villainPos: 'CO', stackDepth: '100BB', correctAction: 'threebet' });
    expect(r3b).toMatch(/flat|call/i);
    expect(r3b).toMatch(/fold/i);

    const rCall = actionRationale({ type: 'vsRaise', heroPos: 'BTN', villainPos: 'CO', stackDepth: '100BB', correctAction: 'call' });
    expect(rCall).toMatch(/3-bet/i);
    expect(rCall).toMatch(/fold/i);

    const rFold = actionRationale({ type: 'vsRaise', heroPos: 'SB', villainPos: 'UTG', stackDepth: '100BB', correctAction: 'fold' });
    expect(rFold).toMatch(/call|3-bet/i);
  });

  it('notes stack depth when short-stacked folds', () => {
    const r = actionRationale({ type: 'rfi', heroPos: 'UTG', stackDepth: '25BB', correctAction: 'fold' });
    expect(r).toMatch(/25BB/);
  });
});

describe('explainQuestion', () => {
  it('combines hand descriptor and rationale for a suited connector RFI raise', () => {
    const txt = explainQuestion({
      type: 'rfi', hand: '76s', heroPos: 'BTN', villainPos: null, stackDepth: '100BB', correctAction: 'raise',
    });
    // Descriptor references the 6.5% flush fact from the feature request example
    expect(txt).toMatch(/6\.5%/);
    // Rationale references the alternative action
    expect(txt).toMatch(/fold/i);
    expect(txt.endsWith('.')).toBe(true);
  });

  it('returns empty string on missing question', () => {
    expect(explainQuestion(null)).toBe('');
    expect(explainQuestion(undefined)).toBe('');
  });
});
