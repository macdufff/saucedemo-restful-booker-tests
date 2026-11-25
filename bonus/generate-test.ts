/**
 * Test-case → Playwright spec pipeline.
 *
 * Default: deterministic parser (no API key).
 * Optional: OPENAI_API_KEY (+ OPENAI_BASE_URL / OPENAI_MODEL) to generate via LLM.
 *
 * Usage:
 *   npx tsx bonus/generate-test.ts bonus/examples/login.valid.md
 *   npx tsx bonus/generate-test.ts --run bonus/examples/login.valid.md
 */

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import { spawnSync } from 'node:child_process';

type CaseFile = {
  title: string;
  steps: string[];
  expected: string[];
};

function parseCase(raw: string): CaseFile {
  const title = (raw.match(/^#\s+(.+)$/m)?.[1] ?? 'Generated case').trim();
  const stepsBlock = raw.split(/##\s*Steps/i)[1]?.split(/##\s*Expected/i)[0] ?? '';
  const expectedBlock = raw.split(/##\s*Expected/i)[1] ?? '';
  const bullets = (block: string) =>
    block
      .split('\n')
      .map((l) => l.replace(/^\s*[-*\d.]+\s*/, '').trim())
      .filter(Boolean);
  return { title, steps: bullets(stepsBlock), expected: bullets(expectedBlock) };
}

function slug(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
}

function lineToPlaywright(step: string): string {
  const s = step.trim();
  const lower = s.toLowerCase();

  if (/open|go to|navigate/.test(lower) && /login|sauce|\/$/.test(lower)) {
    return `  await page.goto('/');`;
  }
  if (/username|user name/.test(lower)) {
    const value = s.match(/[“"']([^"']+)[”"']/)?.[1] ?? 'standard_user';
    return `  await page.locator('[data-test="username"]').fill(${JSON.stringify(value)});`;
  }
  if (/password/.test(lower)) {
    const value = s.match(/[“"']([^"']+)[”"']/)?.[1] ?? 'secret_sauce';
    return `  await page.locator('[data-test="password"]').fill(${JSON.stringify(value)});`;
  }
  if (/click.*login|press.*login|login button/.test(lower)) {
    return `  await page.locator('[data-test="login-button"]').click();`;
  }
  if (/add .*backpack|add to cart.*backpack/.test(lower)) {
    return `  await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();`;
  }
  if (/open cart|shopping cart/.test(lower)) {
    return `  await page.locator('[data-test="shopping-cart-link"]').click();`;
  }
  if (/checkout/.test(lower)) {
    return `  await page.locator('[data-test="checkout"]').click();`;
  }
  return `  // TODO: map step — ${s.replace(/\n/g, ' ')}`;
}

function expectedToPlaywright(exp: string): string {
  const lower = exp.toLowerCase();
  if (/inventory|products/.test(lower) && /url|page|see|catalog/.test(lower)) {
    return `  await expect(page).toHaveURL(/inventory\\.html/);`;
  }
  if (/error/.test(lower) && /password|match|invalid/.test(lower)) {
    return `  await expect(page.locator('[data-test="error"]')).toContainText('do not match');`;
  }
  if (/error/.test(lower) && /locked/.test(lower)) {
    return `  await expect(page.locator('[data-test="error"]')).toContainText('locked out');`;
  }
  if (/cart/.test(lower) && /backpack/.test(lower)) {
    return `  await expect(page.locator('[data-test="inventory-item-name"]')).toContainText('Sauce Labs Backpack');`;
  }
  if (/thank you|order/.test(lower)) {
    return `  await expect(page.locator('[data-test="complete-header"]')).toHaveText('Thank you for your order!');`;
  }
  return `  // TODO: map expected — ${exp.replace(/\n/g, ' ')}`;
}

function generateFromRules(c: CaseFile): string {
  const body = [
    ...c.steps.map(lineToPlaywright),
    ...c.expected.map(expectedToPlaywright),
  ].join('\n');

  return `import { test, expect } from '@playwright/test';

test(${JSON.stringify(c.title)}, async ({ page }) => {
${body}
});
`;
}

async function generateFromLlm(c: CaseFile, raw: string): Promise<string> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return generateFromRules(c);

  const base = (process.env.OPENAI_BASE_URL ?? 'https://api.openai.com/v1').replace(/\/$/, '');
  const model = process.env.OPENAI_MODEL ?? 'gpt-4o-mini';
  const res = await fetch(`${base}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      temperature: 0,
      messages: [
        {
          role: 'system',
          content:
            'Generate a single Playwright TypeScript test for https://www.saucedemo.com. Use @playwright/test, data-test locators, no waitForTimeout. Output ONLY the file contents.',
        },
        { role: 'user', content: raw },
      ],
    }),
  });
  if (!res.ok) {
    console.warn(`LLM HTTP ${res.status}, falling back to rules`);
    return generateFromRules(c);
  }
  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const text = data.choices?.[0]?.message?.content ?? '';
  const fence = text.match(/```(?:ts|typescript)?\n([\s\S]*?)```/);
  return (fence?.[1] ?? text).trim() + '\n';
}

async function main() {
  const args = process.argv.slice(2).filter((a) => a !== '--run');
  const shouldRun = process.argv.includes('--run');
  const input = args[0];
  if (!input) {
    console.error('Usage: npx tsx bonus/generate-test.ts [--run] <case.md>');
    process.exit(1);
  }

  const raw = readFileSync(input, 'utf8');
  const parsed = parseCase(raw);
  const spec = await generateFromLlm(parsed, raw);

  const outDir = join('bonus', 'generated');
  mkdirSync(outDir, { recursive: true });
  const outFile = join(outDir, `${slug(parsed.title)}.spec.ts`);
  writeFileSync(outFile, spec, 'utf8');
  console.log(`Wrote ${outFile}`);

  if (shouldRun) {
    const run = spawnSync(
      'npx',
      ['playwright', 'test', outFile, '--project=ui-chromium'],
      { stdio: 'inherit' },
    );
    process.exit(run.status ?? 1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
