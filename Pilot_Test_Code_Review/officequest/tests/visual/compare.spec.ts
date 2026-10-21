import { test } from '../e2e/helpers';
import { captureComparison, REFERENCE_NAMES, writeComparisonManifest, type ComparisonResult } from './comparison-helpers';

const results: ComparisonResult[] = [];
for (const name of REFERENCE_NAMES) test(`${name}: reference and implementation at 960px side by side @p6`, async ({ page }, testInfo) => {
  const result = await captureComparison(page, name); results.push(result);
  test.skip(result.status === 'MISSING', 'MISSING reference or implementation screenshot');
  await testInfo.attach(`comparison-${name.slice(0, 2)}`, { path: result.comparison, contentType: 'image/png' });
});
test.afterAll(async () => writeComparisonManifest(results));
