import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { readFileSync } from 'node:fs';
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/* The checks from the a11y-library's verify.md, run against the real built
   page. Most of what matters here is not something axe reports — axe is the
   first test and the cheapest one, and the eight after it are the reason this
   file exists.
   ------------------------------------------------------------------------- */

const here = dirname(fileURLToPath(import.meta.url));
const FIXTURES = [join(here, 'fixtures/books.csv'), join(here, 'fixtures/films.csv')];

const THEMES = JSON.parse(
  readFileSync(join(here, '../src/theme/themes.index.json'), 'utf8'),
).themes.map((t) => t.id);

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'];

/* Every check runs against a page in its busiest state: two tabs loaded, a
   header filter chosen, values selected, and both result tables rendered. An
   audit of the empty landing page would miss the chips, the scroll regions and
   the roving tab stop, which is most of what changed. */
async function seed(page) {
  await page.goto('/');
  await page.locator('input[type="file"]').setInputFiles(FIXTURES);
  await expect(page.getByLabel('Tabs')).toBeVisible();

  await pick(page, '#header-selector', 'Genre');
  await pick(page, '#col-filter-0-genre', 'Sci-Fi');

  await page.getByRole('button', { name: 'Get Report' }).click();
  await expect(page.getByRole('heading', { name: /Matched rows/ })).toBeVisible();
}

async function pick(page, inputSelector, optionName) {
  await page.locator(inputSelector).click();
  await page.getByRole('option', { name: optionName, exact: true }).first().click();
}

/* Walks the real tab order with real key presses rather than probing a selector
   list. Three reasons: :focus-visible does not reliably match a programmatic
   focus() call, so a ring check that never presses Tab measures the wrong
   state; the order this returns is the order a keyboard actually gets, which is
   what SC 2.4.3 is about; and it is the only way to see an indicator that is
   drawn somewhere other than on the focused element.

   That last one matters here. react-select rings the .rs__control AROUND its
   input, and the theme console deliberately moves the ring onto its wrapper —
   dropdown.css sets `outline: none` on the toggle and draws it on
   `.dropdown-console:has(.dropdown-toggle:focus-visible)`. A check that reads
   only the focused element calls both of those ringless, which is the check
   being wrong rather than the page. So each stop records a signature of itself
   and the boxes around it, and the same signature is read back once focus has
   left the page; an indicator is present if either the element itself draws one
   or something in that chain changed.

   Motion is emulated off for the walk. --motion is zeroed by the
   prefers-reduced-motion route, so every transition becomes instant and a rect
   read straight after Tab is the settled one — without it the skip link is
   measured mid-slide and reports as still off-screen. */
async function walkTabOrder(page, max = 250) {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.evaluate(() => {
    window.__a11ySignature = (el) => {
      const chain = [
        el,
        el.parentElement,
        el.parentElement?.parentElement,
        el.closest('.rs__control'),
        el.closest('.dropdown-console'),
      ];
      return chain
        .filter(Boolean)
        .map((n) => {
          const c = getComputedStyle(n);
          return [c.outlineStyle, c.outlineWidth, c.boxShadow, c.borderColor].join('~');
        })
        .join('||');
    };
  });

  /* blur() alone is not enough. Chromium keeps a sequential focus navigation
     starting point where the last focused element was, and running a report
     puts focus on the "Matched rows" heading near the bottom of the page — so a
     walk that only blurs starts there and sees five stops instead of twenty.
     document.body.focus() is a no-op on an unfocusable element, so the start
     point is reset by making the root focusable, focusing it, and taking that
     back. */
  await page.evaluate(() => {
    const root = document.documentElement;
    root.setAttribute('tabindex', '-1');
    root.focus();
    root.removeAttribute('tabindex');
  });

  const stops = [];
  for (let i = 0; i < max; i += 1) {
    await page.keyboard.press('Tab');
    const info = await page.evaluate((index) => {
      const el = document.activeElement;
      if (!el || el === document.body || el === document.documentElement) return null;
      // Tagged so the resting signature can be read back after the walk,
      // rather than blurring mid-walk and losing :focus-visible.
      el.setAttribute('data-a11y-stop', String(index));

      let fixed = false;
      for (let n = el; n; n = n.parentElement) {
        if (getComputedStyle(n).position === 'fixed') {
          fixed = true;
          break;
        }
      }

      const cs = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      return {
        index,
        tag: el.tagName.toLowerCase(),
        label:
          (el.getAttribute('aria-label') || el.textContent || el.id || '')
            .replace(/\s+/g, ' ')
            .trim()
            .slice(0, 60) || el.outerHTML.slice(0, 60),
        ownRing:
          (cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0) ||
          (!!cs.boxShadow && cs.boxShadow !== 'none'),
        focusedSignature: window.__a11ySignature(el),
        top: r.top,
        /* Not something the scrollport can push under the rail: a fixed element
           does not scroll, and the rail's own controls ARE the rail. */
        exemptFromRail: fixed || !!el.closest('.site-header'),
      };
    }, i);
    if (!info) break;
    stops.push(info);
  }

  // Focus has left the page by now, so this reads every stop at rest.
  const resting = await page.evaluate(() =>
    Object.fromEntries(
      [...document.querySelectorAll('[data-a11y-stop]')].map((el) => [
        el.getAttribute('data-a11y-stop'),
        window.__a11ySignature(el),
      ]),
    ),
  );
  await page.evaluate(() => {
    for (const el of document.querySelectorAll('[data-a11y-stop]')) {
      el.removeAttribute('data-a11y-stop');
    }
  });
  await page.emulateMedia({ reducedMotion: 'no-preference' });

  return stops.map((s) => ({
    ...s,
    indicated: s.ownRing || resting[String(s.index)] !== s.focusedSignature,
  }));
}

test.describe('accessibility', () => {
  test('axe reports nothing, with nothing left unclaimed', async ({ page }) => {
    await seed(page);
    const { violations } = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
    expect(
      violations.map((v) => `${v.id} (${v.nodes.length}): ${v.nodes[0]?.target?.join(' ')}`),
    ).toEqual([]);
  });

  /* Contrast is the one result that depends on token values rather than markup,
     so it is the one check worth repeating per theme. The rule is run alone —
     a full axe pass 19 times over is not fast enough to keep. */
  test('contrast holds in every theme, and in both auto modes', async ({ page }) => {
    await seed(page);
    const failures = [];

    for (const scheme of ['light', 'dark']) {
      await page.emulateMedia({ colorScheme: scheme });
      await page.evaluate(() => document.documentElement.removeAttribute('data-theme'));
      const { violations } = await new AxeBuilder({ page })
        .withRules(['color-contrast'])
        .analyze();
      if (violations.length) failures.push(`auto/${scheme}: ${violations[0].nodes.length} nodes`);
    }

    await page.emulateMedia({ colorScheme: 'dark' });
    for (const id of THEMES) {
      await page.evaluate((t) => document.documentElement.setAttribute('data-theme', t), id);
      const { violations } = await new AxeBuilder({ page })
        .withRules(['color-contrast'])
        .analyze();
      if (violations.length) {
        failures.push(`${id}: ${violations[0].nodes.map((n) => n.target.join(' ')).join(' | ')}`);
      }
    }

    expect(failures).toEqual([]);
  });

  /* A positive tabindex is the one thing that actually detaches tab order from
     DOM order. The roving chip group moves between 0 and -1 and never above. */
  test('no positive tabindex anywhere', async ({ page }) => {
    await seed(page);
    const positive = await page.$$eval('[tabindex]', (els) =>
      els
        .filter((e) => Number(e.getAttribute('tabindex')) > 0)
        .map((e) => e.outerHTML.slice(0, 120)),
    );
    expect(positive).toEqual([]);
  });

  test('every tab stop is reachable and shows a focus ring', async ({ page }) => {
    await seed(page);
    const stops = await walkTabOrder(page);

    /* The seeded page has, at minimum: the skip link, the motion switch, the
       theme toggle, Choose files, four combobox inputs, four clear buttons, one
       roving chip per field and both table scroll regions. Anything near five
       means the walk started partway down the page rather than at the top. */
    expect(stops.length, 'the walk reached the whole page').toBeGreaterThan(12);

    const ringless = stops.filter((s) => !s.indicated);
    expect(ringless.map((s) => `${s.tag} "${s.label}"`)).toEqual([]);
  });

  /* SC 2.4.11. The rail is sticky, and scrolling forward aligns an element's
     bottom edge — so the header only ever eats an element the keyboard reached
     going BACKWARDS. Bounded on both sides, because an element that was already
     comfortably in view is not "obscured" and would otherwise be reported. */
  test('no focused control is left under the sticky rail', async ({ page }) => {
    await seed(page);
    const railHeight = await page.evaluate(
      () => document.querySelector('.site-header')?.getBoundingClientRect().height ?? 0,
    );

    const stops = await walkTabOrder(page);
    const obscured = stops.filter(
      (s) => !s.exemptFromRail && s.top < railHeight && s.top > -railHeight,
    );
    expect(obscured.map((s) => `${s.tag} "${s.label}" at ${Math.round(s.top)}px`)).toEqual([]);
  });

  /* SC 2.5.8, with the three exceptions that stop this reporting the spec
     instead of the page: a link inside a sentence is sized by the line-height
     around it, a native checkbox or radio is drawn by the browser, and a
     clipped control is not a pointer target in that state. */
  test('every pointer target clears 24x24', async ({ page }) => {
    await seed(page);
    const undersized = await page.evaluate(() => {
      const FLOOR = 24;
      const out = [];
      const targets = document.querySelectorAll(
        'a[href], button, input:not([type="hidden"]), select, textarea, [role="button"]',
      );

      for (const el of targets) {
        // :disabled, not el.disabled — the IDL property misses every control
        // inside a <fieldset disabled>, which reports healthy markup as broken.
        if (el.matches(':disabled')) continue;
        /* Not rendered at all. getComputedStyle only reports the element's OWN
           display, so the buttons inside a closed <dialog> come back as
           `display: block` at 0x0 and would be reported as 0x0 targets. An
           empty client-rect list is what actually means "not laid out". */
        if (el.getClientRects().length === 0) continue;
        const cs = getComputedStyle(el);
        if (cs.display === 'none' || cs.visibility === 'hidden') continue;
        // A clipped control is not a pointer target in that state.
        if (cs.clipPath !== 'none') continue;
        if (el.matches('input[type="checkbox"], input[type="radio"]')) continue;

        // An inline link: its parent holds text other than the link itself.
        if (el.tagName === 'A') {
          const parentText = (el.parentElement?.textContent ?? '').trim();
          const own = (el.textContent ?? '').trim();
          if (parentText.length > own.length + 1) continue;
        }

        // The control, or any label bound to it, may carry the target.
        const boxes = [el.getBoundingClientRect()];
        if (el.id) {
          for (const l of document.querySelectorAll(`label[for="${CSS.escape(el.id)}"]`)) {
            boxes.push(l.getBoundingClientRect());
          }
        }
        const ok = boxes.some((b) => b.width >= FLOOR && b.height >= FLOOR);
        if (!ok) {
          const b = boxes[0];
          out.push(
            `${el.tagName.toLowerCase()} "${(el.getAttribute('aria-label') || el.textContent || el.id || '').trim().slice(0, 40)}" ${Math.round(b.width)}x${Math.round(b.height)}`,
          );
        }
      }
      return out;
    });

    expect(undersized).toEqual([]);
  });

  /* The media query is the OS preference and data-motion="off" is the in-page
     switch. They are different mechanisms, and a rule gated on only one of them
     looks correct until it meets the other. */
  test('reduced motion zeroes every duration, by both routes', async ({ page }) => {
    const readDurations = () =>
      page.evaluate(() =>
        [...document.querySelectorAll('*')]
          .map((el) => {
            const cs = getComputedStyle(el);
            const d = [cs.transitionDuration, cs.animationDuration].join(' ');
            return /[1-9]/.test(d) ? `${el.tagName.toLowerCase()}.${el.className}: ${d}` : null;
          })
          .filter(Boolean)
          .slice(0, 10),
      );

    await seed(page);

    await page.emulateMedia({ reducedMotion: 'reduce' });
    expect(await readDurations(), 'prefers-reduced-motion route').toEqual([]);

    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.evaluate(() => document.documentElement.setAttribute('data-motion', 'off'));
    expect(await readDurations(), 'data-motion route').toEqual([]);
  });

  /* Two halves, and the second is the one that matters: the block exists, AND
     turning the media on actually changes what is painted. The first half alone
     passes for a block full of dead rules. */
  test('the forced-colors rules exist and take effect', async ({ page }) => {
    await seed(page);

    const snapshot = () =>
      page.evaluate(() =>
        [...document.querySelectorAll('.rs__multi-value, .zone, .notice, .switch .track, dialog')]
          .concat([...document.querySelectorAll('[class*="chipRemove"], [class*="button"]')])
          .map((el) => {
            const cs = getComputedStyle(el);
            return [cs.backgroundColor, cs.color, cs.borderTopColor, cs.borderTopStyle].join('|');
          })
          .join('\n'),
      );

    const before = await snapshot();
    await page.emulateMedia({ forcedColors: 'active' });
    const after = await snapshot();

    expect(before.length, 'there is something to compare').toBeGreaterThan(0);
    expect(after, 'forced colors repaints the component surfaces').not.toBe(before);
  });

  /* SC 1.4.10. 320px is 1280px at 400% zoom, which is what the criterion is
     really about — and it is where a grid track minimum or one unbreakable
     token in a cell shows up. */
  test('nothing overflows sideways at 320px', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 900 });
    await seed(page);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });

  /* The failure that started this pass: react-select ships the chip's remove
     control as a <div role="button"> with no tabindex and no key handler, so a
     keyboard could not reach it. This asserts the shape of the replacement
     rather than the absence of a violation, because axe reports neither. */
  test('a chip can be removed by keyboard alone', async ({ page }) => {
    await seed(page);

    const tabsField = page.locator('.field', { has: page.locator('#tab-selector') });
    const chips = tabsField.locator('.rs__multi-value');
    await expect(chips).toHaveCount(2);

    const removes = tabsField.locator('.rs__multi-value button');
    await expect(removes).toHaveCount(2);

    // Exactly one tab stop for the whole group, however many chips there are.
    const tabIndexes = await removes.evaluateAll((els) =>
      els.map((e) => e.getAttribute('tabindex')),
    );
    expect(tabIndexes.filter((t) => t === '0')).toHaveLength(1);

    /* Named from the clipped verb plus the chip's own visible text. The chip is
       a TAB, and parseFiles names a CSV's single sheet after the file's
       basename — so "books.csv" becomes the tab "books". */
    await expect(removes.first()).toHaveAccessibleName('Remove books');

    await removes.first().focus();
    await page.keyboard.press('ArrowRight');
    await expect(removes.nth(1)).toBeFocused();

    await page.keyboard.press('Enter');
    await expect(chips).toHaveCount(1);

    // Focus must land somewhere real — left alone it falls to <body>, and the
    // next Tab restarts at the top of the page.
    const parked = await page.evaluate(() => document.activeElement?.tagName.toLowerCase());
    expect(parked).not.toBe('body');
  });

  /* react-select's clear control is a <div> with aria-hidden="true" and a
     mousedown handler: no name, no keyboard route, and hidden from assistive
     tech outright. The replacement has to be all three of those things. */
  test('clear-all is a named button that works from the keyboard', async ({ page }) => {
    await seed(page);

    const headers = page.locator('.field', { has: page.locator('#header-selector') });
    const clear = headers.getByRole('button', { name: 'Clear all header filters' });
    await expect(clear).toHaveCount(1);

    await expect(headers.locator('.rs__multi-value')).toHaveCount(1);
    await clear.focus();
    await page.keyboard.press('Enter');
    await expect(headers.locator('.rs__multi-value')).toHaveCount(0);

    // The button unmounts with the last chip, so focus owes somewhere to land.
    await expect(page.locator('#header-selector')).toBeFocused();
  });

  /* react-select's own handler returns without acting on Enter while the menu
     is closed, so it was a dead key on a focused combobox. Every open key is
     asserted together, because the fix must not cost the ones that worked. */
  test('every open key opens a focused combobox, and Escape closes it', async ({ page }) => {
    await seed(page);
    const input = page.locator('#return-cols');
    const menu = page
      .locator('.field', { has: page.locator('#return-cols') })
      .locator('.rs__menu');

    for (const key of ['Enter', 'ArrowDown', 'ArrowUp', 'Space']) {
      await input.focus();
      await expect(menu, `${key}: starts closed`).toHaveCount(0);
      await page.keyboard.press(key);
      await expect(menu, `${key} opens the menu`).toHaveCount(1);
      await page.keyboard.press('Escape');
      await expect(menu, `Escape closes it again after ${key}`).toHaveCount(0);
    }

    /* Enter still picks the focused option once the menu is open — the override
       only fires while it is closed, and this is what proves it. */
    const chips = page
      .locator('.field', { has: page.locator('#return-cols') })
      .locator('.rs__multi-value');
    const before = await chips.count();
    await input.focus();
    await page.keyboard.press('Enter');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    await expect(chips).toHaveCount(before + 1);
  });

  /* A required field is marked twice over: an asterisk for the eye and
     aria-required for everything else. Asserting both together is the point —
     an asterisk alone is decoration nobody hears, and aria-required alone is a
     state nobody sees. */
  test('required fields are marked visually and in the tree', async ({ page }) => {
    await seed(page);

    for (const id of ['#tab-selector', '#header-selector', '#return-cols']) {
      const input = page.locator(id);
      await expect(input, `${id} announces as required`).toHaveAttribute(
        'aria-required',
        'true',
      );

      const label = page.locator(`label[for="${id.slice(1)}"]`);
      await expect(label, `${id} carries a visible asterisk`).toContainText('*');

      /* And the asterisk stays out of the name. aria-hidden on it is what keeps
         "Tabs" from becoming "Tabs *", which would then have to match the
         visible label under SC 2.5.3 anyway. */
      const name = await input.evaluate((el) => el.labels?.[0]?.textContent ?? '');
      expect(name).toContain('*');
      await expect(input).toHaveAccessibleName(name.replace('*', '').trim());
    }

    // A per-column filter is NOT required on its own — only one value anywhere
    // in the group is — so the mark belongs to the fieldset, not to each select.
    await expect(page.locator('#col-filter-0-genre')).not.toHaveAttribute('aria-required', 'true');
    await expect(page.getByRole('group', { name: /Column Filters/ })).toHaveAccessibleName(
      'Column Filters (at least one value required)',
    );

    // SC 3.3.2: the convention is explained once, and the * in that sentence is
    // real text rather than aria-hidden like the ones on the labels — it is the
    // character being defined.
    await expect(page.getByText('Fields marked with * are required.')).toBeVisible();
  });

  /* Soft-disabled: the button stays reachable and says why it is off, which a
     `disabled` button cannot do. */
  test('the disabled Get Report button is focusable and explains itself', async ({ page }) => {
    await page.goto('/');
    await page.locator('input[type="file"]').setInputFiles(FIXTURES);

    const button = page.getByRole('button', { name: 'Get Report' });
    await expect(button).toHaveAttribute('aria-disabled', 'true');
    await button.focus();
    await expect(button).toBeFocused();
    await expect(button).toHaveAccessibleDescription(/Select at least one filter value/);
  });
});
