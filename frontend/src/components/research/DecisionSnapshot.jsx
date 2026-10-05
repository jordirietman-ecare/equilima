import { BarChart3, ShieldCheck, Target, TrendingUp } from 'lucide-react';

const numeric = (value) => {
  if (value == null || typeof value === 'boolean' || String(value).trim() === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

const num = (value, digits = 1) => {
  const n = numeric(value);
  return n == null ? '—' : n.toFixed(digits);
};

const pct = (value, digits = 1) => {
  const n = numeric(value);
  if (n == null) return '—';
  return `${n >= 0 ? '+' : ''}${n.toFixed(digits)}%`;
};

function Metric({ label, value, helper, tone = 'neutral', icon: Icon }) {
  const toneClass = tone === 'gain'
    ? 'text-[var(--eq-gain)]'
    : tone === 'loss'
      ? 'text-[var(--eq-loss)]'
      : 'text-[var(--eq-text)]';

  return (
    <div className="min-w-0 rounded-xl border border-[var(--eq-border)] bg-[var(--eq-card2)] p-3.5">
      <div className="flex items-center justify-between gap-3">
        <span className="eq-label">{label}</span>
        {Icon && <Icon className="h-3.5 w-3.5 text-[var(--eq-text3)]" strokeWidth={1.8} />}
      </div>
      <div className={`eq-num mt-2 text-[20px] font-semibold tracking-tight ${toneClass}`}>{value}</div>
      {helper && <div className="mt-1 text-[11px] leading-4 text-[var(--eq-text3)]" title={helper}>{helper}</div>}
    </div>
  );
}

function averageQuality(snowflake) {
  if (!snowflake) return null;
  const values = ['value', 'future', 'past', 'health', 'dividend']
    .map((key) => numeric(snowflake[key]))
    .filter((value) => value != null);
  if (!values.length) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export default function DecisionSnapshot({ data }) {
  if (!data) return null;

  const s = data.summary || {};
  const rm = data.risk_metrics || {};
  const isStock = !data.asset_class || data.asset_class === 'stock';
  const quality = averageQuality(data.snowflake);
  const price = numeric(s.price);
  const target = numeric(s.target_mean);
  const targetUpside = price > 0 && target > 0
    ? ((target / price) - 1) * 100
    : null;
  const revenueGrowth = numeric(data.growth?.revenue_growth_pct);
  const profitMargin = numeric(data.profitability?.profit_margin_pct);

  const targetTone = Number.isFinite(targetUpside)
    ? (targetUpside >= 0 ? 'gain' : 'loss')
    : 'neutral';
  const growthTone = revenueGrowth != null
    ? (Number(revenueGrowth) >= 0 ? 'gain' : 'loss')
    : 'neutral';

  return (
    <section aria-label="Decision snapshot" className="eq-card overflow-hidden">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[var(--eq-border)] px-4 py-3.5">
        <div>
          <div className="eq-label">Decision snapshot</div>
          <p className="mt-1 max-w-2xl text-[12px] leading-5 text-[var(--eq-text2)]">
            {isStock ? 'Valuation, expectations, model scores and risk at a glance.' : 'Price performance and risk at a glance.'} Missing data is shown as —.
          </p>
        </div>
        {s.recommendation && (
          <span className="eq-chip eq-chip-accent capitalize">{String(s.recommendation).replaceAll('_', ' ')}</span>
        )}
      </div>

      <div className="grid gap-2.5 p-3 sm:grid-cols-2 2xl:grid-cols-4">
        {isStock ? <>
          <Metric
            label="Analyst target upside"
            value={targetUpside == null ? '—' : pct(targetUpside)}
            helper={target > 0 ? `Mean target ${s.currency || '$'} ${num(target, 2)}` : 'No consensus target available'}
            tone={targetTone}
            icon={Target}
          />
          <Metric
            label="Composite score"
            value={quality == null ? '—' : `${num(quality, 1)} / 6`}
            helper={quality == null ? 'Quality model unavailable' : 'Model average · value, future, past, health, dividend'}
            tone={quality != null && quality >= 4 ? 'gain' : 'neutral'}
            icon={ShieldCheck}
          />
          <Metric
            label="Revenue growth"
            value={revenueGrowth == null ? '—' : pct(revenueGrowth)}
            helper={profitMargin == null ? 'Reported revenue growth' : `Net profit margin ${num(profitMargin, 1)}%`}
            tone={growthTone}
            icon={TrendingUp}
          />
        </> : <>
          <Metric label="1M performance" value={pct(rm.performance?.['1M'])} helper="Price change over 21 trading days" icon={TrendingUp} />
          <Metric label="Annualized volatility" value={numeric(rm.volatility_annual) == null ? '—' : `${num(rm.volatility_annual)}%`} helper="Based on available price history" icon={BarChart3} />
          <Metric label="Max drawdown" value={numeric(rm.max_drawdown) == null ? '—' : `${num(rm.max_drawdown)}%`} helper="Largest peak-to-trough decline" icon={ShieldCheck} />
        </>}
        <Metric
          label="Sharpe ratio"
          value={rm.sharpe_ratio == null ? '—' : num(rm.sharpe_ratio, 2)}
          helper="Annualized · up to 2Y history · risk-free rate 0%"
          tone={Number(rm.sharpe_ratio) > 1 ? 'gain' : 'neutral'}
          icon={BarChart3}
        />
      </div>

      {(s.pe_trailing != null || s.pe_forward != null || rm.beta != null || rm.volatility_annual != null) && (
        <div className="flex flex-wrap gap-x-5 gap-y-2 border-t border-[var(--eq-border)] bg-[var(--eq-card2)]/60 px-4 py-2.5 text-[10.5px] text-[var(--eq-text3)]">
          {s.pe_trailing != null && <span>P/E <strong className="eq-num font-semibold text-[var(--eq-text2)]">{num(s.pe_trailing, 1)}</strong></span>}
          {s.pe_forward != null && <span>Forward P/E <strong className="eq-num font-semibold text-[var(--eq-text2)]">{num(s.pe_forward, 1)}</strong></span>}
          {rm.beta != null && <span>Beta <strong className="eq-num font-semibold text-[var(--eq-text2)]">{num(rm.beta, 2)}</strong></span>}
          {rm.volatility_annual != null && <span>Annualized vol <strong className="eq-num font-semibold text-[var(--eq-text2)]">{num(rm.volatility_annual, 1)}%</strong></span>}
        </div>
      )}
    </section>
  );
}
