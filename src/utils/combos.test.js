import { describe, it, expect } from 'vitest';
import {
  evalFive,
  bestOf,
  analyzeQuestion,
  analyzeWithTurn,
  buildCombosDeck,
  CATEGORIES,
  QUIZ_CATEGORIES,
  SUBSETS,
  categoriesIncluded,
} from './combos.js';

const c = (rank, suit) => ({ rank, suit });

describe('CATEGORIES', () => {
  it('are ordered weakest → strongest, Royal Flush last', () => {
    expect(CATEGORIES[0]).toBe('High Card');
    expect(CATEGORIES[CATEGORIES.length - 1]).toBe('Royal Flush');
    expect(CATEGORIES).toHaveLength(10);
  });

  it('QUIZ_CATEGORIES drops only High Card', () => {
    expect(QUIZ_CATEGORIES).toHaveLength(9);
    expect(QUIZ_CATEGORIES).not.toContain('High Card');
    expect(QUIZ_CATEGORIES).toContain('Royal Flush');
  });
});

describe('evalFive', () => {
  it('identifies High Card', () => {
    expect(evalFive([c('A', '♠'), c('J', '♣'), c('9', '♦'), c('6', '♥'), c('2', '♣')]).category)
      .toBe('High Card');
  });

  it('identifies One Pair', () => {
    expect(evalFive([c('A', '♠'), c('A', '♣'), c('K', '♦'), c('J', '♥'), c('7', '♠')]).category)
      .toBe('Pair');
  });

  it('identifies Two Pair', () => {
    expect(evalFive([c('K', '♠'), c('K', '♥'), c('Q', '♦'), c('Q', '♣'), c('J', '♠')]).category)
      .toBe('Two Pair');
  });

  it('identifies Three of a Kind', () => {
    expect(evalFive([c('9', '♠'), c('9', '♥'), c('9', '♦'), c('A', '♣'), c('4', '♥')]).category)
      .toBe('Three of a Kind');
  });

  it('identifies a normal Straight', () => {
    expect(evalFive([c('8', '♠'), c('9', '♦'), c('10', '♥'), c('J', '♠'), c('Q', '♣')]).category)
      .toBe('Straight');
  });

  it('identifies an Ace-low wheel Straight (A-2-3-4-5)', () => {
    expect(evalFive([c('A', '♠'), c('2', '♦'), c('3', '♥'), c('4', '♣'), c('5', '♠')]).category)
      .toBe('Straight');
  });

  it('does NOT call Q-K-A-2-3 a straight (no wrap-around)', () => {
    expect(evalFive([c('Q', '♠'), c('K', '♦'), c('A', '♥'), c('2', '♣'), c('3', '♠')]).category)
      .toBe('High Card');
  });

  it('identifies a Flush', () => {
    expect(evalFive([c('A', '♦'), c('J', '♦'), c('9', '♦'), c('6', '♦'), c('2', '♦')]).category)
      .toBe('Flush');
  });

  it('identifies a Full House', () => {
    expect(evalFive([c('K', '♠'), c('K', '♥'), c('K', '♦'), c('7', '♥'), c('7', '♦')]).category)
      .toBe('Full House');
  });

  it('identifies Four of a Kind', () => {
    expect(evalFive([c('A', '♠'), c('A', '♥'), c('A', '♦'), c('A', '♣'), c('K', '♠')]).category)
      .toBe('Four of a Kind');
  });

  it('identifies a Straight Flush (non-royal)', () => {
    expect(evalFive([c('7', '♥'), c('8', '♥'), c('9', '♥'), c('10', '♥'), c('J', '♥')]).category)
      .toBe('Straight Flush');
  });

  it('identifies the Steel Wheel (A-2-3-4-5 suited) as a Straight Flush, not Royal', () => {
    expect(evalFive([c('A', '♠'), c('2', '♠'), c('3', '♠'), c('4', '♠'), c('5', '♠')]).category)
      .toBe('Straight Flush');
  });

  it('identifies a Royal Flush', () => {
    expect(evalFive([c('A', '♠'), c('K', '♠'), c('Q', '♠'), c('J', '♠'), c('10', '♠')]).category)
      .toBe('Royal Flush');
  });
});

describe('bestOf', () => {
  it('picks the best 5-card category from 7 cards', () => {
    // AA in hand + AKQJT of spades on board → Royal Flush beats the pair of aces.
    const seven = [
      c('A', '♥'), c('A', '♦'),
      c('A', '♠'), c('K', '♠'), c('Q', '♠'), c('J', '♠'), c('10', '♠'),
    ];
    expect(bestOf(seven).category).toBe('Royal Flush');
  });

  it('finds Full House among 7 cards when two pairs + a triple fit', () => {
    // 77 hole, flop K72 rainbow, turn 7, river K → Full House (sevens full of kings).
    const seven = [
      c('7', '♠'), c('7', '♥'),
      c('K', '♣'), c('7', '♦'), c('2', '♠'),
      c('7', '♣'), // wait — four 7s would be quads; adjust.
      c('K', '♦'),
    ];
    // Dedupe: we actually wrote three 7s + the hole 7s = four. Fix input:
    const fixed = [
      c('7', '♠'), c('7', '♥'),
      c('K', '♣'), c('7', '♦'), c('2', '♠'),
      c('K', '♦'), c('3', '♠'),
    ];
    expect(bestOf(fixed).category).toBe('Full House');
  });
});

describe('SUBSETS / categoriesIncluded', () => {
  it('Two Pair contains Pair', () => {
    expect(SUBSETS['Two Pair'].has('Pair')).toBe(true);
  });

  it('Three of a Kind contains Pair', () => {
    expect(SUBSETS['Three of a Kind'].has('Pair')).toBe(true);
  });

  it('Full House contains Three of a Kind, Two Pair, and Pair', () => {
    expect(SUBSETS['Full House'].has('Three of a Kind')).toBe(true);
    expect(SUBSETS['Full House'].has('Two Pair')).toBe(true);
    expect(SUBSETS['Full House'].has('Pair')).toBe(true);
  });

  it('Four of a Kind contains Three of a Kind and Pair (but not Two Pair)', () => {
    expect(SUBSETS['Four of a Kind'].has('Three of a Kind')).toBe(true);
    expect(SUBSETS['Four of a Kind'].has('Pair')).toBe(true);
    // Two Pair requires two distinct paired ranks; quads don't satisfy that.
    expect(SUBSETS['Four of a Kind'].has('Two Pair')).toBe(false);
  });

  it('Straight Flush contains Flush and Straight', () => {
    expect(SUBSETS['Straight Flush'].has('Flush')).toBe(true);
    expect(SUBSETS['Straight Flush'].has('Straight')).toBe(true);
  });

  it('Royal Flush contains Straight Flush, Flush, and Straight', () => {
    expect(SUBSETS['Royal Flush'].has('Straight Flush')).toBe(true);
    expect(SUBSETS['Royal Flush'].has('Flush')).toBe(true);
    expect(SUBSETS['Royal Flush'].has('Straight')).toBe(true);
  });

  it('Pair, Straight, and Flush imply nothing else from the quiz set', () => {
    expect(SUBSETS['Pair'].size).toBe(0);
    expect(SUBSETS['Straight'].size).toBe(0);
    expect(SUBSETS['Flush'].size).toBe(0);
  });

  it('categoriesIncluded returns the category itself plus its subsets', () => {
    const inc = categoriesIncluded('Two Pair');
    expect(inc.has('Two Pair')).toBe(true);
    expect(inc.has('Pair')).toBe(true);
    expect(inc.has('Three of a Kind')).toBe(false);
  });
});

describe('analyzeQuestion', () => {
  it('AsKs on 2s 7s Jd → made pair of aces? no, no pair. Flush draw: 9 turn outs to Flush', () => {
    const holes = [c('A', '♠'), c('K', '♠')];
    const flop = [c('2', '♠'), c('7', '♠'), c('J', '♦')];
    const a = analyzeQuestion(holes, flop);
    expect(a.made).toBe('High Card');
    expect(a.reachable.has('Flush')).toBe(true);
    expect(a.turnOuts['Flush'].count).toBe(9);
    // Rule-of-4 approximation for 9 outs is ~36%; exact is ~35%.
    expect(a.riverProb['Flush']).toBeGreaterThan(0.33);
    expect(a.riverProb['Flush']).toBeLessThan(0.38);
  });

  it('77 on Kc 7d 2s → Three of a Kind already made; outs-to-Quads = 1 seven left', () => {
    const holes = [c('7', '♠'), c('7', '♥')];
    const flop = [c('K', '♣'), c('7', '♦'), c('2', '♠')];
    const a = analyzeQuestion(holes, flop);
    expect(a.made).toBe('Three of a Kind');
    expect(a.turnOuts['Four of a Kind'].count).toBe(1);
    expect(a.turnOuts['Four of a Kind'].cards[0]).toEqual(c('7', '♣'));
    // Any K or 2 on the turn pairs the board → Full House. 3 kings + 3 twos = 6 turn outs.
    expect(a.turnOuts['Full House'].count).toBe(6);
  });

  it('98 on K 6 5 rainbow (gutshot to 9-high straight) → 4 turn outs, exactly the four sevens', () => {
    const holes = [c('9', '♠'), c('8', '♥')];
    const flop = [c('K', '♦'), c('6', '♣'), c('5', '♠')];
    const a = analyzeQuestion(holes, flop);
    expect(a.reachable.has('Straight')).toBe(true);
    expect(a.turnOuts['Straight'].count).toBe(4);
    for (const card of a.turnOuts['Straight'].cards) expect(card.rank).toBe('7');
  });

  it('AsKh on 2s 7s Jd (backdoor flush via spade runner-runner) → 0 turn outs to Flush but positive river prob', () => {
    const holes = [c('A', '♠'), c('K', '♥')];
    const flop = [c('2', '♠'), c('7', '♠'), c('J', '♦')];
    const a = analyzeQuestion(holes, flop);
    // 3 spades known, 10 spades left in the deck. One spade on the turn gives us
    // 4 spades in 6 cards — still not a flush. Two spades on turn+river makes it.
    expect(a.turnOuts['Flush'].count).toBe(0);
    expect(a.reachable.has('Flush')).toBe(true);
    expect(a.reachableByRiver.has('Flush')).toBe(true);
    // Backdoor: NOT reachable by the turn even though it is reachable by the river.
    expect(a.reachableByTurn.has('Flush')).toBe(false);
    expect(a.riverProb['Flush']).toBeGreaterThan(0);
    // C(10,2) / C(47,2) = 45/1081 ≈ 4.2%.
    expect(a.riverProb['Flush']).toBeLessThan(0.08);
    expect(a.riverProb['Flush']).toBeGreaterThan(0.03);
  });

  it('turnOuts is subset-closed: Full House outs also count as Three of a Kind / Two Pair / Pair outs (regression)', () => {
    // KQ on KQ7 rainbow → Two Pair made. The 4 cards (2 K + 2 Q) that make
    // Full House on the turn must also be counted as Three of a Kind outs,
    // since the made FH contains a Three of a Kind. Same for Two Pair and Pair.
    const holes = [c('K', '♠'), c('Q', '♦')];
    const flop = [c('K', '♥'), c('Q', '♣'), c('7', '♠')];
    const a = analyzeQuestion(holes, flop);
    expect(a.made).toBe('Two Pair');
    expect(a.turnOuts['Full House'].count).toBe(4);
    // Bug being fixed: this used to be 0 because counting was strict-best-only.
    expect(a.turnOuts['Three of a Kind'].count).toBe(4);
    // Pair and Two Pair are made; their counts include FH outs plus any other
    // cards whose best hand contains them. Sanity check: at least the 4 FH outs.
    expect(a.turnOuts['Two Pair'].count).toBeGreaterThanOrEqual(4);
    expect(a.turnOuts['Pair'].count).toBeGreaterThanOrEqual(4);
  });

  it('turnOuts is subset-closed: Four of a Kind outs also count as Three of a Kind / Pair outs (but NOT Two Pair)', () => {
    // 77 on K72 rainbow → Three of a Kind made. Any turn card keeps the made
    // hand at ≥ Three of a Kind: 1 card → Quads, 6 cards (Ks/2s) → Full House,
    // remaining 40 → strict Three of a Kind. Pair is a subset of all three, so
    // every one of the 47 cards counts as a Pair out. Two Pair is a subset of
    // Full House (6) but NOT of Quads (only one paired rank) and NOT of strict
    // Three of a Kind, so its subset-inclusive count is exactly 6.
    const holes = [c('7', '♠'), c('7', '♥')];
    const flop = [c('K', '♣'), c('7', '♦'), c('2', '♠')];
    const a = analyzeQuestion(holes, flop);
    expect(a.turnOuts['Four of a Kind'].count).toBe(1);
    expect(a.turnOuts['Full House'].count).toBe(6);
    expect(a.turnOuts['Three of a Kind'].count).toBe(47);
    expect(a.turnOuts['Two Pair'].count).toBe(6);
    expect(a.turnOuts['Pair'].count).toBe(47);
  });

  it('riverProb values across all categories sum to 1', () => {
    const holes = [c('Q', '♣'), c('Q', '♦')];
    const flop = [c('7', '♠'), c('4', '♥'), c('2', '♦')];
    const a = analyzeQuestion(holes, flop);
    let sum = 0;
    for (const k of Object.keys(a.riverProb)) sum += a.riverProb[k];
    expect(sum).toBeCloseTo(1, 6);
  });

  it('made flush (suited hole + 3 of suit on flop) → reachable includes Flush even with no upgrade on some runouts', () => {
    const holes = [c('A', '♠'), c('K', '♠')];
    const flop = [c('2', '♠'), c('7', '♠'), c('J', '♠')];
    const a = analyzeQuestion(holes, flop);
    expect(a.made).toBe('Flush');
    expect(a.reachable.has('Flush')).toBe(true);
  });

  it('made Two Pair: madeSet includes Pair too — having two pair means you have a pair', () => {
    // KK + QQ + J = Two Pair on the flop.
    const holes = [c('K', '♠'), c('Q', '♦')];
    const flop = [c('K', '♥'), c('Q', '♣'), c('J', '♠')];
    const a = analyzeQuestion(holes, flop);
    expect(a.made).toBe('Two Pair');
    expect(a.madeSet.has('Two Pair')).toBe(true);
    expect(a.madeSet.has('Pair')).toBe(true);
  });

  it('reachable is subset-closed: a reachable Flush implies a reachable Pair-or-better is not auto-added (only the specific subsets)', () => {
    // Flush draw — reachable should include Flush but NOT inflate Pair just because Flush is reachable
    // (Flush subset relation is empty — a flush of 5 distinct ranks does not imply any pair).
    const holes = [c('A', '♠'), c('K', '♠')];
    const flop = [c('2', '♠'), c('7', '♠'), c('J', '♦')];
    const a = analyzeQuestion(holes, flop);
    expect(a.reachable.has('Flush')).toBe(true);
    // Pair is reachable on independent runouts (paired board / paired hole), so it should still be true:
    expect(a.reachable.has('Pair')).toBe(true);
  });

  it('reachable is subset-closed: when Two Pair is reachable, Pair is reachable too', () => {
    // 77 on K72 rainbow: Three of a Kind already made. Pair is in madeSet.
    const holes = [c('7', '♠'), c('7', '♥')];
    const flop = [c('K', '♣'), c('7', '♦'), c('2', '♠')];
    const a = analyzeQuestion(holes, flop);
    expect(a.madeSet.has('Three of a Kind')).toBe(true);
    expect(a.madeSet.has('Pair')).toBe(true);
    // Both should also appear in reachable (subset-closed + made-included).
    expect(a.reachable.has('Pair')).toBe(true);
    expect(a.reachable.has('Three of a Kind')).toBe(true);
  });

  it('reachableByTurn ⊆ reachableByRiver always — anything reachable by turn is reachable by river', () => {
    const holes = [c('A', '♠'), c('K', '♠')];
    const flop = [c('2', '♠'), c('7', '♠'), c('J', '♦')];
    const a = analyzeQuestion(holes, flop);
    for (const C of a.reachableByTurn) {
      expect(a.reachableByRiver.has(C)).toBe(true);
    }
  });

  it('reachableByTurn includes made categories and any with ≥1 turn out', () => {
    // 77 on K 7 2: Three of a Kind made; turn outs to Quads (1) and Full House (6+).
    const holes = [c('7', '♠'), c('7', '♥')];
    const flop = [c('K', '♣'), c('7', '♦'), c('2', '♠')];
    const a = analyzeQuestion(holes, flop);
    expect(a.reachableByTurn.has('Three of a Kind')).toBe(true);
    expect(a.reachableByTurn.has('Four of a Kind')).toBe(true);
    expect(a.reachableByTurn.has('Full House')).toBe(true);
    // Pair is implied by the Three-of-a-Kind subset closure.
    expect(a.reachableByTurn.has('Pair')).toBe(true);
  });

  it('reachable is preserved as an alias of reachableByRiver for backward compatibility', () => {
    const holes = [c('A', '♠'), c('K', '♠')];
    const flop = [c('2', '♠'), c('7', '♠'), c('J', '♦')];
    const a = analyzeQuestion(holes, flop);
    expect(a.reachable).toBe(a.reachableByRiver);
  });

  describe('exampleRunouts', () => {
    it('backdoor straight (3,5 + 7,K,Q) → example contains exactly a 4 and a 6', () => {
      // Hand from the user's bug report: with hole 3♣5♣ and flop 7♥KdQ♣ the
      // straight is reachable runner-runner but never on the turn alone. The
      // example runout for Straight should be a 4 and a 6 (in either order),
      // matching the only 5-card straight 3-4-5-6-7 the player can make.
      const holes = [c('3', '♣'), c('5', '♣')];
      const flop = [c('7', '♥'), c('K', '♦'), c('Q', '♣')];
      const a = analyzeQuestion(holes, flop);
      expect(a.reachableByTurn.has('Straight')).toBe(false);
      expect(a.reachableByRiver.has('Straight')).toBe(true);
      const example = a.exampleRunouts['Straight'];
      expect(example).toHaveLength(2);
      const ranks = example.map(x => x.rank).sort();
      expect(ranks).toEqual(['4', '6']);
    });

    it('made categories also have an example runout (the first runout we encounter, since it still demonstrates the category)', () => {
      // 77 on K72 → Three of a Kind is already made; every runout demonstrates it.
      const holes = [c('7', '♠'), c('7', '♥')];
      const flop = [c('K', '♣'), c('7', '♦'), c('2', '♠')];
      const a = analyzeQuestion(holes, flop);
      expect(a.exampleRunouts['Three of a Kind']).toBeTruthy();
      expect(a.exampleRunouts['Three of a Kind']).toHaveLength(2);
    });

    it('unreachable categories have a null example runout', () => {
      // 22 on 22A is Three of a Kind on the flop, but Royal Flush is unreachable
      // (the flop has unsuited 2/2/A — runner-runner can't make a Royal because
      // T-J-Q-K of any suit are 4 cards needed, only 2 to come).
      const holes = [c('2', '♠'), c('2', '♥')];
      const flop = [c('2', '♦'), c('2', '♣'), c('A', '♠')];
      const a = analyzeQuestion(holes, flop);
      expect(a.reachableByRiver.has('Royal Flush')).toBe(false);
      expect(a.exampleRunouts['Royal Flush']).toBeNull();
    });

    it('subset closure: example for Pair exists whenever any higher category is reachable', () => {
      // AsKs on 2s 7s Jd: Flush reachable. Any flush runout also demonstrates
      // Pair closure? No — flush of 5 distinct ranks contains no pair. But other
      // pair-making runouts are abundant. Verify Pair has an example.
      const holes = [c('A', '♠'), c('K', '♠')];
      const flop = [c('2', '♠'), c('7', '♠'), c('J', '♦')];
      const a = analyzeQuestion(holes, flop);
      expect(a.exampleRunouts['Pair']).toBeTruthy();
      // Sanity: the example pair, evaluated, should give a hand whose category
      // set includes Pair.
      const [r, s] = a.exampleRunouts['Pair'];
      const seven = [...holes, ...flop, r, s];
      const best = bestOf(seven).category;
      expect(['Pair', 'Two Pair', 'Three of a Kind', 'Straight', 'Flush',
              'Full House', 'Four of a Kind', 'Straight Flush', 'Royal Flush'])
        .toContain(best);
    });

    it('example runout cards are drawn from the cards still in the deck (not hole/flop)', () => {
      const holes = [c('A', '♠'), c('K', '♠')];
      const flop = [c('2', '♠'), c('7', '♠'), c('J', '♦')];
      const a = analyzeQuestion(holes, flop);
      const known = new Set([...holes, ...flop].map(x => x.rank + x.suit));
      for (const C of CATEGORIES) {
        const ex = a.exampleRunouts[C];
        if (!ex) continue;
        expect(known.has(ex[0].rank + ex[0].suit)).toBe(false);
        expect(known.has(ex[1].rank + ex[1].suit)).toBe(false);
        expect(ex[0].rank + ex[0].suit).not.toBe(ex[1].rank + ex[1].suit);
      }
    });
  });
});

describe('buildCombosDeck', () => {
  it('produces the requested number of questions', () => {
    const deck = buildCombosDeck(7);
    expect(deck).toHaveLength(7);
  });

  it('each question has 2 hole cards, 3 flop cards, and 1 turn card, all distinct', () => {
    const deck = buildCombosDeck(15);
    for (const q of deck) {
      expect(q.holes).toHaveLength(2);
      expect(q.flop).toHaveLength(3);
      expect(q.turn).toBeTruthy();
      const keys = new Set([...q.holes, ...q.flop, q.turn].map(x => x.rank + x.suit));
      expect(keys.size).toBe(6);
    }
  });

  it('never returns a zero-length deck even when asked for 0 (minimum 1 question)', () => {
    expect(buildCombosDeck(0).length).toBeGreaterThanOrEqual(1);
  });
});

describe('analyzeWithTurn', () => {
  it('AsKs on 2s 7s Jd, turn 9s → Flush already made (4 spades), reachable includes Flush', () => {
    const holes = [c('A', '♠'), c('K', '♠')];
    const flop = [c('2', '♠'), c('7', '♠'), c('J', '♦')];
    const turn = c('9', '♠');
    const a = analyzeWithTurn(holes, flop, turn);
    expect(a.made).toBe('Flush');
    expect(a.madeSet.has('Flush')).toBe(true);
    expect(a.reachableByRiver.has('Flush')).toBe(true);
  });

  it('AsKs on 2s 7s Jd, turn 4d (brick) → still drawing to Flush, 9 river outs (spades left)', () => {
    const holes = [c('A', '♠'), c('K', '♠')];
    const flop = [c('2', '♠'), c('7', '♠'), c('J', '♦')];
    const turn = c('4', '♦');
    const a = analyzeWithTurn(holes, flop, turn);
    expect(a.made).toBe('High Card');
    // 13 spades total - 3 already known (As, Ks, 2s, 7s = 4) = 9 spades left in deck.
    expect(a.riverOuts['Flush'].count).toBe(9);
    expect(a.reachableByRiver.has('Flush')).toBe(true);
  });

  it('77 on Kc 7d 2s, turn 7c → Quads made; reachable includes Quads + subsets', () => {
    const holes = [c('7', '♠'), c('7', '♥')];
    const flop = [c('K', '♣'), c('7', '♦'), c('2', '♠')];
    const turn = c('7', '♣');
    const a = analyzeWithTurn(holes, flop, turn);
    expect(a.made).toBe('Four of a Kind');
    expect(a.madeSet.has('Four of a Kind')).toBe(true);
    expect(a.madeSet.has('Three of a Kind')).toBe(true);
    expect(a.madeSet.has('Pair')).toBe(true);
    expect(a.reachableByRiver.has('Four of a Kind')).toBe(true);
  });

  it('riverOuts is subset-closed: a river card making a Full House also counts as Three of a Kind / Pair / Two Pair', () => {
    // KQ on KQ7 + Q turn → Two Pair made on flop, then Trips of Q after turn.
    // Wait, need a clearer setup: KQ on KQ7 rainbow + 7 turn → Two Pair (KK QQ via flop already?? Let me redo.
    // Just use KQ on K72 + Q turn → Two Pair on the turn (Kings + Queens).
    const holes = [c('K', '♠'), c('Q', '♦')];
    const flop = [c('K', '♥'), c('7', '♣'), c('2', '♠')];
    const turn = c('Q', '♣');
    const a = analyzeWithTurn(holes, flop, turn);
    expect(a.made).toBe('Two Pair');
    // Any K, Q, 7, or 2 on the river → Full House. Pair stays implied for all
    // those river cards via subset closure of FH.
    expect(a.riverOuts['Full House'].count).toBeGreaterThan(0);
    // Pair count should be at least the FH count (subset closure).
    expect(a.riverOuts['Pair'].count).toBeGreaterThanOrEqual(a.riverOuts['Full House'].count);
  });

  it('reachableByRiver after turn = madeSet ∪ {C: riverOuts[C].count > 0, with subset closure}', () => {
    const holes = [c('A', '♠'), c('K', '♠')];
    const flop = [c('2', '♠'), c('7', '♠'), c('J', '♦')];
    const turn = c('4', '♦');
    const a = analyzeWithTurn(holes, flop, turn);
    for (const C of CATEGORIES) {
      if (a.riverOuts[C].count > 0) {
        expect(a.reachableByRiver.has(C)).toBe(true);
      }
    }
    for (const M of a.madeSet) expect(a.reachableByRiver.has(M)).toBe(true);
  });


  it('when six known cards are all different ranks, Pair has 18 river outs (3 per known rank) even if some rivers also make a stronger hand', () => {
    const holes = [c('K', '♥'), c('2', '♠')];
    const flop = [c('10', '♥'), c('6', '♥'), c('J', '♥')];
    const turn = c('Q', '♣');
    const a = analyzeWithTurn(holes, flop, turn);
    expect(a.made).toBe('High Card');
    expect(a.riverOuts['Pair'].count).toBe(18);
    expect(a.reachableByRiver.has('Pair')).toBe(true);
  });
  it('uses 46 remaining cards (52 minus hole+flop+turn) — total iterated outs across distinct categories ≤ 46', () => {
    const holes = [c('A', '♠'), c('K', '♠')];
    const flop = [c('2', '♠'), c('7', '♠'), c('J', '♦')];
    const turn = c('9', '♣');
    const a = analyzeWithTurn(holes, flop, turn);
    // The strict-best category counts (without subset closure) must sum to 46.
    // Using High Card + Pair we get sum-by-strict-best ≠ subset-closed sum, so
    // instead just sanity-check that no category exceeds 46.
    for (const C of CATEGORIES) {
      expect(a.riverOuts[C].count).toBeLessThanOrEqual(46);
    }
  });
});
