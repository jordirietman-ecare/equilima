import { useEffect, useMemo, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { fetchMacroOverview } from '../api';

const TAPE = ['S&P 500', 'Nasdaq', 'VIX', 'US 10Y Yield', 'Gold', 'Oil WTI', 'Copper', 'Bitcoin', 'Ethereum', 'USD Index'];

function usMarketOpen() {
  const now = new Date();
  const et = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
  const day = et.getDay();
  if (day === 0 || day === 6) return false;
  const mins = et.getHours() * 60 + et.getMinutes();
  return mins >= 570 && mins < 960;
}

function fmtPrice(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return '—';
  if (Math.abs(n) >= 1000) return Math.round(n).toLocaleString();
  if (Math.abs(n) >= 100) return n.toFixed(1);
  return n.toFixed(2);
}

export default function MarketTape({ onOpenSymbol }) {
  const [assets, setAssets] = useState(null);
  const [open, setOpen] = useState(usMarketOpen());

  useEffect(() => {
    let cancel = false;
    fetchMacroOverview().then((d) => {
      if (cancel || !d?.assets) return;
      const byName = new Map(d.assets.map((a) => [a.name, a]));
      setAssets(TAPE.map((name) => byName.get(name)).filter(Boolean));
    }).catch(() => {});
    const id = window.setInterval(() => setOpen(usMarketOpen()), 60_000);
    return () => {
      cancel = true;
      window.clearInterval(id);
    };
  }, []);

  const items = useMemo(() => (assets || []).map((a) => ({
    name: a.name,
    symbol: a.symbol,
    price: a.price,
    chg: a.change_1m,
  })), [assets]);

  if (!items.length) return null;

  return (
    <div className="border-b border-[var(--eq-border)] bg-[var(--eq-card)]/55">
      <div className="mx-auto flex max-w-[1680px] items-stretch px-3 sm:px-6">
        <div className="flex shrink-0 items-center border-r border-[var(--eq-border)] pr-3">
          <div className="flex items-center gap-2 rounded-xl bg-[var(--eq-card2)] px-2.5 py-1.5">
            <span className={`h-1.5 w-1.5 rounded-full ${open ? 'bg-[var(--eq-gain)] animate-pulse' : 'bg-[var(--eq-text3)]'}`} />
            <span className="text-[9.5px] font-semibold uppercase tracking-[0.11em] text-[var(--eq-text3)]">
              US {open ? 'open' : 'closed'}
            </span>
          </div>
        </div>

        <div className="no-scrollbar flex min-w-0 flex-1 items-center overflow-x-auto py-1">
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
                  {it.chg >= 0 ? '+' : ''}{it.chg}%
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
