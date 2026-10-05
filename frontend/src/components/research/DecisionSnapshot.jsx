import { BarChart3, ShieldCheck, Target, TrendingUp } from 'lucide-react';

const num = (value, digits = 1) => {
  const n = Number(value);
  return Number.isFinite(n) ? n.toFixed(digits) : '—';
};

const pct = (value, digits = 1) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return '—';
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
      {helper && <div className="mt-1 truncate text-[10.5px] text-[var(--eq-text3)]" title={helper}>{helper}</div>}
    </div>
  );
}

function averageQuality(snowflake) {
  if (!snowflake) return null;
  const values = ['value', 'future', 'past', 'health', 'dividend']
    .map((key) => Number(snowflake[key]))
    .filter(Number.isFinite);
  if (!values.length) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export default function DecisionSnapshot({ data }) {
  if (!data) return null;

  const s = data.summary || {};
  const rm = data.risk_metrics || {};
  const quality = averageQuality(data.snowflake);
  const targetUpside = Number(s.price) && Number(s.target_mean)
    ? ((Number(s.target_mean) / Number(s.price)) - 1) * 100
    : null;
  const revenueGrowth = data.growth?.revenue_growth_pct;
  const profitMargin = data.profitability?.profit_margin_pct;

  const targetTone = Number.isFinite(targetUpside)
    ? (targetUpside >= 0 ? 'gain' : 'loss')
    : 'neutral';
  const growthTone = Number.isFinite(Number(revenueGrowth))
    ? (Number(revenueGrowth) >= 0 ? 'gain' : 'loss')
    : 'neutral';

  return (
    <section className="eq-card overflow-hidden">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[var(--eq-border)] px-4 py-3.5">
        <div>
          <div className="eq-label">Decision snapshot</div>
          <p className="mt-1 max-w-2xl text-[12px] leading-5 text-[var(--eq-text2)]">
            A compact read of valuation, expectations, business quality and risk. Use it as a starting point for deeper research.
          </p>
        </div>
        {s.recommendation && (
          <span className="eq-chip eq-chip-accent capitalize">{String(s.recommendation).replaceAll('_', ' ')}</span>
        )}
      </div>

      <div className="grid gap-2.5 p-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          label="Analyst target"
          value={targetUpside == null ? '—' : pct(targetUpside)}
          helper={s.target_mean != null ? `Mean target ${s.currency || '$'}${num(s.target_mean, 2)}` : 'No consensus target available'}
          tone={targetTone}
          icon={Target}
        />
        <Metric
          label="Quality score"
          value={quality == null ? '—' : `${num(quality, 1)} / 6`}
          helper={quality == null ? 'Quality model unavailable' : 'Average across value, future, past, health and dividend'}
          tone={quality != null && quality >= 4 ? 'gain' : 'neutral'}
          icon={ShieldCheck}
        />
        <Metric
          label="Revenue growth"
          value={revenueGrowth == null ? '—' : pct(revenueGrowth)}
          helper={profitMargin == null ? 'TTM growth' : `TTM · net margin ${num(profitMargin, 1)}%`}
          tone={growthTone}
          icon={TrendingUp}
        />
        <Metric
          label="Risk-adjusted"
          value={rm.sharpe_ratio == null ? '—' : num(rm.sharpe_ratio, 2)}
          helper={rm.max_drawdown == null ? '1Y Sharpe ratio' : `1Y Sharpe · max drawdown ${num(rm.max_drawdown, 1)}%`}
          tone={Number(rm.sharpe_ratio) > 1 ? 'gain' : 'neutral'}
          icon={BarChart3}
        />
      </div>

      {(s.pe_trailing != null || rm.beta != null || rm.volatility_annual != null) && (
        <div className="flex flex-wrap gap-x-5 gap-y-2 border-t border-[var(--eq-border)] bg-[var(--eq-card2)]/60 px-4 py-2.5 text-[10.5px] text-[var(--eq-text3)]">
          {s.pe_trailing != null && <span>P/E <strong className="eq-num font-semibold text-[var(--eq-text2)]">{num(s.pe_trailing, 1)}</strong></span>}
          {s.pe_forward != null && <span>Forward P/E <strong className="eq-num font-semibold text-[var(--eq-text2)]">{num(s.pe_forward, 1)}</strong></span>}
          {rm.beta != null && <span>Beta <strong className="eq-num font-semibold text-[var(--eq-text2)]">{num(rm.beta, 2)}</strong></span>}
          {rm.volatility_annual != null && <span>1Y vol <strong className="eq-num font-semibold text-[var(--eq-text2)]">{num(rm.volatility_annual, 1)}%</strong></span>}
        </div>
      )}
    </section>
  );
}
