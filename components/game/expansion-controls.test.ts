import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { emptyBonuses, SUITS, SUIT_CARDS } from "./BonusControls";

// Structural guards for the suit bonus row. The row is generated from
// SUIT_CARDS, so these lock down the layout contract that drives it:
//   -5 +5 +10 | -5 +5 +10 | -5 +5 +10 | -5 +5 +20

const root = join(import.meta.dir, "..", "..");
const read = (rel: string) => readFileSync(join(root, rel), "utf8");

const bonusControls = read("components/game/BonusControls.tsx");
const suitRow = read("components/game/SuitBonusRow.tsx");

describe("emptyBonuses factory", () => {
  test("zero-initialises every per-suit expansion card", () => {
    const empty = emptyBonuses();
    for (const suit of SUITS) {
      expect(empty[`${suit.key}PlusFive`]).toBe(false);
      expect(empty[`${suit.key}MinusFive`]).toBe(false);
    }
    expect(empty.second).toBe(0);
  });

  test("still zero-initialises the base bonuses", () => {
    const empty = emptyBonuses();
    expect(empty.treasure).toBe(0);
    expect(empty.mermaid).toBe(0);
    expect(empty.pirate).toBe(0);
    expect(empty.skullKing).toBe(false);
    expect(empty.greenBonus).toBe(false);
  });

  test("returns a fresh object each call (no shared mutable default)", () => {
    const a = emptyBonuses();
    a.greenPlusFive = true;
    expect(emptyBonuses().greenPlusFive).toBe(false);
  });
});

describe("suit row layout", () => {
  test("is 12 cells with the expansion, 4 without", () => {
    expect(SUIT_CARDS).toHaveLength(12);
    expect(SUIT_CARDS.filter((c) => !c.expansionOnly)).toHaveLength(4);
  });

  test("reads -5 +5 +10 / -5 +5 +10 / -5 +5 +10 / -5 +5 +20", () => {
    expect(SUIT_CARDS.map((c) => c.label)).toEqual([
      "-5", "+5", "+10",
      "-5", "+5", "+10",
      "-5", "+5", "+10",
      "-5", "+5", "+20",
    ]);
  });

  test("collapses to the original +10 +10 +10 +20 without the expansion", () => {
    expect(
      SUIT_CARDS.filter((c) => !c.expansionOnly).map((c) => c.label)
    ).toEqual(["+10", "+10", "+10", "+20"]);
  });

  test("each suit's three cells are adjacent and share its color", () => {
    for (const [i, suit] of SUITS.entries()) {
      const group = SUIT_CARDS.slice(i * 3, i * 3 + 3);
      expect(group.map((c) => c.field)).toEqual([
        `${suit.key}MinusFive`,
        `${suit.key}PlusFive`,
        `${suit.key}Bonus`,
      ]);
      expect(new Set(group.map((c) => c.textClass)).size).toBe(1);
    }
  });

  test("the trump suit is the +20 and carries no color class", () => {
    const dark = SUITS[SUITS.length - 1];
    expect(dark.key).toBe("dark");
    expect(dark.bonusPoints).toBe(20);
    expect(dark.textClass).toBe("");
  });

  test("the three colored suits are +10", () => {
    for (const suit of SUITS.slice(0, 3)) {
      expect(suit.bonusPoints).toBe(10);
      expect(suit.textClass).toContain(`text-${suit.key}-500`);
    }
  });

  test("every card maps to a distinct bonus field", () => {
    const fields = SUIT_CARDS.map((c) => c.field);
    expect(new Set(fields).size).toBe(fields.length);
  });

  test("the row renders from SUIT_CARDS, not hardcoded cells", () => {
    expect(suitRow).toMatch(/SUIT_CARDS\.filter/);
    expect(suitRow).toMatch(/line\.map/);
  });

  test("the ±5 cells only render with the expansion", () => {
    expect(suitRow).toMatch(/expansion \|\| !card\.expansionOnly/);
  });
});

describe("mobile wrapping", () => {
  test("wraps to two lines of six on a phone, one line otherwise", () => {
    expect(suitRow).toMatch(
      /expansion && isMobile \? cards\.length \/ 2 : cards\.length/
    );
  });

  test("the split keeps each suit's three cells on one line", () => {
    // Six cells per line means two whole suits per line — a suit's -5/+5/+bonus
    // must never straddle the break.
    const perLine = 6;
    for (let i = 0; i < SUIT_CARDS.length; i += 3) {
      const suitCells = [i, i + 1, i + 2];
      const lines = new Set(suitCells.map((c) => Math.floor(c / perLine)));
      expect(lines.size).toBe(1);
    }
  });

  test("both mobile lines are evenly filled", () => {
    const perLine = SUIT_CARDS.length / 2;
    expect(perLine).toBe(6);
    expect(SUIT_CARDS.length % perLine).toBe(0);
  });

  test("the four-cell row is never split", () => {
    // Wrapping is gated on `expansion`, so the plain row stays on one line.
    expect(suitRow).toMatch(/expansion && isMobile/);
  });
});

describe("bonus defaults are not duplicated inline", () => {
  test("BonusControls creates player bonuses via emptyBonuses()", () => {
    expect(bonusControls).toMatch(/\|\|\s*emptyBonuses\(\)/);
  });

  test("no inline bonus literal remains in BonusControls", () => {
    expect(bonusControls).not.toMatch(/\|\|\s*\{\s*\n\s*greenBonus:/);
  });
});

describe("single-card exclusivity", () => {
  test("claiming a suit card clears it from the previous holder", () => {
    expect(bonusControls).toMatch(/getPlayerWithBonus\(card\.value\)/);
    expect(bonusControls).toMatch(/\[card\.field\]:\s*false/);
  });

  test("the Second and Skull King each clear their previous holder", () => {
    expect(bonusControls).toMatch(/getPlayerWithBonus\("second"\)/);
    expect(bonusControls).toMatch(/getPlayerWithBonus\("skullKing"\)/);
  });

  test("a claimed card hides for players who cannot hold it", () => {
    expect(suitRow).toMatch(
      /!isVisible\(card\.value\) && "invisible pointer-events-none"/
    );
  });
});

describe("the Second sits beside the pirates", () => {
  test("renders between the pirate toggle and the Skull King", () => {
    const pirate = bonusControls.indexOf('value="pirate"');
    const second = bonusControls.indexOf('value="second"');
    const skullKing = bonusControls.indexOf('value="skullKing"');
    expect(pirate).toBeGreaterThan(-1);
    expect(second).toBeGreaterThan(pirate);
    expect(skullKing).toBeGreaterThan(second);
  });

  test("the specials row widens to 5 columns for it", () => {
    expect(bonusControls).toMatch(/columns=\{expansion \? 5 : 4\}/);
  });
});

describe("details breakdown covers the expansion", () => {
  const detailsTab = read("components/game/DetailsTab.tsx");

  test("counts the per-suit 7s and 8s", () => {
    expect(detailsTab).toMatch(/countSuitCards\(bonuses, "PlusFive"\) \* 5/);
    expect(detailsTab).toMatch(/countSuitCards\(bonuses, "MinusFive"\) \* 5/);
    expect(detailsTab).toMatch(/bonuses\.second \* 30/);
  });

  test("opens the breakdown for a negative bonus total, not just positive", () => {
    // Four 7s on a met bid make the bonus negative; the popover must still open.
    expect(detailsTab).toMatch(/potentialBonusScore !== 0/);
  });
});
