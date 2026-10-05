import { useEffect, useMemo, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { fetchMacroOverview } from '../api';

const TAPE = ['S&P 500', 'Nasdaq', 'VIX', 'US 10Y Yield', 'Gold', 'Oil WTI', 'Copper', 'Bitcoin', 'Ethereum', 'USD Index'];

function fmtPrice(value) {
  if (value == null || typeof value === 'boolean' || String(value).trim() === '') return '—';
  const n = Number(value);
  if (!Number.isFinite(n)) return '—';
  if (Math.abs(n) >= 1000) return Math.round(n).toLocaleString();
  if (Math.abs(n) >= 100) return n.toFixed(1);
  return n.toFixed(2);
}

export default function MarketTape({ onOpenSymbol }) {
  const [assets, setAssets] = useState(null);
  const [status, setStatus] = useState('loading');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancel = false;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 15_000);
    fetchMacroOverview({ signal: controller.signal }).then((d) => {
      if (cancel) return;
      if (!Array.isArray(d?.assets)) throw new Error('Market data unavailable');
      const byName = new Map(d.assets.map((a) => [a.name, a]));
      const next = TAPE.map((name) => byName.get(name)).filter(Boolean);
      setAssets(next);
      setStatus(next.length ? 'ready' : 'empty');
    }).catch(() => { if (!cancel) setStatus('error'); })
      .finally(() => window.clearTimeout(timeout));
    return () => {
      cancel = true;
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [attempt]);

  const items = useMemo(() => (assets || []).map((a) => ({
    name: a.name,
    symbol: a.symbol,
    price: a.price,
    chg: a.change_1m == null || String(a.change_1m).trim() === '' || !Number.isFinite(Number(a.change_1m)) ? null : Number(a.change_1m),
  })), [assets]);

  return (
    <div className="border-b border-[var(--eq-border)] bg-[var(--eq-card)]/55">
      <div className="mx-auto flex max-w-[1680px] items-stretch px-3 sm:px-6">
        <div className="flex shrink-0 items-center border-r border-[var(--eq-border)] pr-3">
          <div className="py-2">
            <div className="text-[10px] font-semibold text-[var(--eq-text2)]">Markets</div>
            <div className="text-[10px] text-[var(--eq-text3)]">1M change</div>
          </div>
        </div>

        <div role="region" aria-label="Market prices and one-month changes" tabIndex={0} className="flex min-w-0 flex-1 items-center overflow-x-auto py-1">
          {status !== 'ready' && (
            <div role="status" className="flex items-center gap-3 px-3 text-[11px] text-[var(--eq-text3)]">
              <span>{status === 'loading' ? 'Loading markets…' : status === 'empty' ? 'No market data available' : 'Market data unavailable'}</span>
              {status !== 'loading' && <button type="button" className="shrink-0 text-[var(--eq-accent)] underline underline-offset-2"
                onClick={() => { setStatus('loading'); setAttempt((value) => value + 1); }}>Retry</button>}
            </div>
          )}
          {items.map((it) => (
            <button
              key={it.symbol}
              type="button"
              onClick={() => onOpenSymbol?.(it.symbol)}
              className="group mx-0.5 flex shrink-0 items-center gap-2 rounded-xl px-2.5 py-1.5 text-left transition-colors hover:bg-[var(--eq-card2)]"
              title={`${it.name} — open in Research`}
            >
              <span>
                <span className="block text-[9.5px] font-medium text-[var(--eq-text3)] group-hover:text-[var(--eq-text2)]">
                  {it.name}
                </span>
                <span className="eq-num mt-0.5 block text-[11px] font-semibold leading-none text-[var(--eq-text)]">
                  {fmtPrice(it.price)}
                </span>
              </span>
              {it.chg != null && (
                <span className={`eq-num rounded-md px-1.5 py-0.5 text-[9.5px] font-semibold ${
                  it.chg >= 0
                    ? 'bg-[var(--eq-gain-soft)] text-[var(--eq-gain)]'
                    : 'bg-[var(--eq-loss-soft)] text-[var(--eq-loss)]'
                }`}>
                  {it.chg >= 0 ? '+' : ''}{it.chg.toFixed(1)}%
                </span>
              )}
              <ChevronRight className="h-3 w-3 text-[var(--eq-text3)] opacity-0 transition-opacity group-hover:opacity-100" strokeWidth={1.8} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
