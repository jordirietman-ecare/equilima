import assert from 'node:assert/strict';
import { test, after } from 'node:test';
import { createServer } from 'vite';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

// Render the actual component through Vite's JSX pipeline, without a browser or
// mocked HTTP responses. These are contract cases, not live-market validation.
const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
after(() => server.close());
const { default: DecisionSnapshot } = await server.ssrLoadModule('/src/components/research/DecisionSnapshot.jsx');
const render = (data) => renderToStaticMarkup(React.createElement(DecisionSnapshot, { data }));

test('missing/invalid fundamentals never become zero scores or positive growth', () => {
  const html = render({ summary: { price: 100, target_mean: null }, snowflake: { value: null, future: '', past: false, health: 'invalid' }, growth: { revenue_growth_pct: '' } });
  assert.doesNotMatch(html, /0\.0 \/ 6|\+0\.0%|NaN|Infinity/);
  assert.match(html, /Quality model unavailable/);
  assert.match(html, /No consensus target available/);
});

test('valid zero scores and zero growth remain visible', () => {
  const html = render({ summary: { price: 100, target_mean: 125, currency: 'USD' }, snowflake: { value: 0, future: null }, growth: { revenue_growth_pct: 0 } });
  assert.match(html, /\+25\.0%/);
  assert.match(html, /USD 125\.00/);
  assert.match(html, /0\.0 \/ 6/);
  assert.match(html, /\+0\.0%/);
});

test('risk labels match annualized metrics calculated from up to two years', () => {
  const html = render({ summary: { pe_forward: 20 }, risk_metrics: { sharpe_ratio: 1.234, volatility_annual: 25 } });
  assert.match(html, /1\.23/);
  assert.match(html, /up to 2Y history/);
  assert.match(html, /risk-free rate 0%/);
  assert.match(html, /Forward P\/E/);
  assert.doesNotMatch(html, /1Y Sharpe|1Y vol/);
});

test('non-stock instruments show price risk instead of inapplicable company metrics', () => {
  const html = render({ asset_class: 'crypto', risk_metrics: { performance: { '1M': 12.3 }, max_drawdown: -40, volatility_annual: 70 } });
  assert.match(html, /\+12\.3%/);
  assert.match(html, /-40\.0%/);
  assert.match(html, /70\.0%/);
  assert.doesNotMatch(html, /Analyst target|Composite score|Revenue growth/);
});

test('invalid or zero prices do not yield spurious target upside', () => {
  for (const price of [0, -1, null, '', 'invalid']) {
    assert.doesNotMatch(render({ summary: { price, target_mean: 125 } }), /Infinity|NaN|\+125/);
  }
});
