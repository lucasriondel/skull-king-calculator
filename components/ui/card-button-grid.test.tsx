import { describe, expect, mock, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { CardButtonGrid, handleCellKeyDown } from "./card-button-grid";

// Accessibility guard for issue #10: bid/trick/bonus grid cells must behave as
// real buttons — focusable, keyboard-operable, with a visible focus ring —
// while placeholder/padding cells stay out of the tab order and non-interactive.
describe("CardButtonGrid.Cell accessibility (issue #10)", () => {
  test("an interactive cell is a focusable button", () => {
    const html = renderToStaticMarkup(
      <CardButtonGrid.Cell colIndex={0} onClick={() => {}}>
        1
      </CardButtonGrid.Cell>
    );
    expect(html).toContain('role="button"');
    expect(html).toContain('tabindex="0"');
  });

  test("an interactive cell shows a visible focus ring", () => {
    const html = renderToStaticMarkup(
      <CardButtonGrid.Cell colIndex={0} onClick={() => {}}>
        1
      </CardButtonGrid.Cell>
    );
    expect(html).toContain("focus-visible:ring");
  });

  test("a placeholder cell is neither focusable nor a button", () => {
    const html = renderToStaticMarkup(
      <CardButtonGrid.Cell colIndex={0} placeholder />
    );
    expect(html).not.toContain('role="button"');
    expect(html).not.toContain("tabindex");
  });

  test("a display-only cell (no onClick) is not focusable", () => {
    const html = renderToStaticMarkup(
      <CardButtonGrid.Cell colIndex={0}>x</CardButtonGrid.Cell>
    );
    expect(html).not.toContain('role="button"');
    expect(html).not.toContain("tabindex");
  });

  test("Enter and Space activate a focused cell and suppress default", () => {
    for (const key of ["Enter", " "]) {
      const onClick = mock(() => {});
      let prevented = false;
      handleCellKeyDown(
        { key, preventDefault: () => (prevented = true) } as never,
        onClick
      );
      expect(onClick).toHaveBeenCalledTimes(1);
      expect(prevented).toBe(true);
    }
  });

  test("other keys do not activate the cell", () => {
    const onClick = mock(() => {});
    let prevented = false;
    handleCellKeyDown(
      { key: "a", preventDefault: () => (prevented = true) } as never,
      onClick
    );
    expect(onClick).not.toHaveBeenCalled();
    expect(prevented).toBe(false);
  });
});
