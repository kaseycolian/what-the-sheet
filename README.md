# What the Sheet

Find the rows you want in a spreadsheet, without writing a formula.

Load CSV or Excel files, pick values from dropdowns, and get two tables back: the rows that
matched and the rows that didn't.

**[Open the app](https://kaseycolian.github.io/what-the-sheet/)**

***Your files never leave your browser. There is no server, no upload, and no account.***

## What it accepts

- `.csv`
- `.xlsx`, `.xls`, `.xlsm`, `.xlsb`

You can load several files at once. Each file becomes a **tab** you can filter on — an Excel
workbook creates one tab per sheet, a CSV creates one tab.

## How to use it

1. **Drop your files on the drop zone**, or click *Choose files*.
2. **Tabs** — select which tabs you want to search through. This decides which rows/columns are
   used and what other filters have access to.
3. **Filter by headers** — pick the columns you want to filter on. One dropdown appears per
   column you pick.
4. **Column filters** — pick the values from the headers dropdown to match. Every distinct value
   in that column is listed.
5. **Columns to display in results** — pick what you want to see in the output tables.
6. **Get Report**.

### How matching works

A row matches if **any** selected value matches — not all of them.

Selecting `Genre: Sci-Fi` and `Year: 1984` returns rows that are Sci-Fi **or** from 1984, not
rows that are both. Tabs are the exception: they narrow the row set before anything else runs.

Cells holding a comma-separated list are split, so a cell reading `Sci-Fi, Horror` matches a
`Sci-Fi` filter.

### Other things worth knowing

- Loading a new file resets everything — tabs, filters, results. You'll be asked first if
  something is already loaded.
- Results appear as **Matched rows** and **Not matched rows**, each with a count.
- WCAG 2.2 AA compliant. Light and Dark modes supported.

### Keyboard

Everything works without a mouse.

| Key | Where | What it does |
| --- | --- | --- |
| `Tab` | anywhere | Next control. The filter chips are one tab stop, not one on each chip. |
| `Enter` / `↓` / `↑` / `Space` | a dropdown | Open the list |
| `↑` `↓` | an open list | Move through options |
| `Enter` | an open list | Select the highlighted option |
| `Esc` | an open list | Close it |
| `←` `→` `Home` `End` | a selected-value chip | Move between filter chips |
| `Enter` / `Space` / `Delete` | a selected-value chip | Remove that value |

---

## Run it locally

Requires **Node 20 or newer** and npm.

```bash
git clone https://github.com/kaseycolian/what-the-sheet.git
cd what-the-sheet
npm install
npm run dev
```

Then open the URL it prints (usually `http://localhost:5173`).

### Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Type-check and build to `dist/` |
| `npm run preview` | Serve the built `dist/` locally |
| `npm run test:a11y` | Accessibility suite (Playwright + Axe-core) |

`npm run test:a11y` needs a browser the first time:

```bash
npx playwright install chromium
```

### Built with

React 19, TypeScript, Vite 6, [papaparse](https://www.papaparse.com/) for CSV, and
[SheetJS](https://sheetjs.com/) for Excel.
