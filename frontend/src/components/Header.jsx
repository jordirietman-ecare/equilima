import { useState, useRef, useEffect, useCallback } from 'react';
import {
  User,
  LogOut,
  ChevronDown,
  Settings,
  HelpCircle,
  Mail,
  FileText,
  Shield,
  BookOpen,
  Sun,
  Moon,
  Search,
} from 'lucide-react';
import { getStoredSiteMode, setStoredSiteMode } from '../siteTheme';

const TABS = [
  { id: 'research', label: 'Research', short: 'Research', hint: 'Companies & markets' },
  { id: 'screener', label: 'Screener', short: 'Screen', hint: 'Find opportunities' },
  { id: 'backtest', label: 'Backtesting', short: 'Backtest', hint: 'Test strategies' },
];

const TAB_PATHS = {
  research: '/',
  screener: '/screener',
  backtest: '/backtest',
};

const SUPPORT_EMAIL = 'info@equilima.com';

function ThemeButton() {
  const [dark, setDark] = useState(() => getStoredSiteMode() === 'dark');

  useEffect(() => {
    const on = () => setDark(getStoredSiteMode() === 'dark');
    window.addEventListener('eq-theme-changed', on);
    window.addEventListener('storage', on);
    return () => {
      window.removeEventListener('eq-theme-changed', on);
      window.removeEventListener('storage', on);
    };
  }, []);

  const toggle = useCallback(() => {
    const next = !dark;
    setDark(next);
    setStoredSiteMode(next ? 'dark' : 'light');
  }, [dark]);

  return (
    <button
      type="button"
      role="switch"
      aria-checked={dark}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      onClick={toggle}
      className="flex h-9 w-9 items-center justify-center rounded-xl border border-transparent text-[var(--eq-text3)] transition-all hover:border-[var(--eq-border)] hover:bg-[var(--eq-card)] hover:text-[var(--eq-text)]"
    >
      {dark
        ? <Sun className="h-[15px] w-[15px]" strokeWidth={1.8} />
        : <Moon className="h-[15px] w-[15px]" strokeWidth={1.8} />}
    </button>
  );
}

function UserMenu({ user, setActiveTab, onSignOut }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const goAccount = () => {
    setActiveTab('account');
    setOpen(false);
  };

  const itemClass =
    'w-full flex items-center gap-2.5 px-3 py-2 text-left text-[12.5px] text-[var(--eq-text2)] hover:bg-[var(--eq-card2)] hover:text-[var(--eq-text)] rounded-lg transition-colors';

  return (
    <div className="relative z-[200]" ref={rootRef}>
      <button
        type="button"
        id="user-menu-button"
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls="user-menu"
        onClick={() => setOpen((v) => !v)}
        className={`flex h-9 items-center gap-1.5 max-w-[200px] rounded-xl border px-2 transition-all ${
          open
            ? 'border-[var(--eq-border2)] bg-[var(--eq-card)] text-[var(--eq-text)]'
            : 'border-transparent text-[var(--eq-text2)] hover:border-[var(--eq-border)] hover:bg-[var(--eq-card)] hover:text-[var(--eq-text)]'
        }`}
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[var(--eq-accent-soft)]">
          <User className="h-3.5 w-3.5 text-[var(--eq-accent)]" strokeWidth={2} />
        </span>
        <span className="hidden max-w-[120px] truncate text-xs sm:block">{user.name || user.email}</span>
        <ChevronDown className={`h-3.5 w-3.5 shrink-0 text-[var(--eq-text3)] transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          id="user-menu"
          role="menu"
          aria-labelledby="user-menu-button"
          className="absolute right-0 top-full z-[300] mt-2 w-60 rounded-2xl border border-[var(--eq-border)] bg-[var(--eq-elev)] p-1.5 shadow-[var(--eq-shadow-pop)]"
        >
          <div className="border-b border-[var(--eq-border)] px-3 pb-2.5 pt-1.5">
            <p className="eq-label">Signed in</p>
            <p className="mt-0.5 truncate text-xs font-medium text-[var(--eq-text)]" title={user.email}>
              {user.email}
            </p>
          </div>

          <div className="py-1">
            <button type="button" role="menuitem" className={itemClass} onClick={goAccount}>
              <Settings className="h-4 w-4 text-[var(--eq-text3)]" strokeWidth={1.8} />
              Account & security
            </button>
            <a
              role="menuitem"
              href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('Equilima — Help')}`}
              className={itemClass}
              onClick={() => setOpen(false)}
            >
              <HelpCircle className="h-4 w-4 text-[var(--eq-text3)]" strokeWidth={1.8} />
              Help & support
            </a>
            <a
              role="menuitem"
              href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('Equilima — Contact')}`}
              className={itemClass}
              onClick={() => setOpen(false)}
            >
              <Mail className="h-4 w-4 text-[var(--eq-text3)]" strokeWidth={1.8} />
              Contact us
            </a>
          </div>

          <div className="border-t border-[var(--eq-border)] py-1">
            <a
              role="menuitem"
              href="/privacy.html"
              target="_blank"
              rel="noopener noreferrer"
              className={itemClass}
              onClick={() => setOpen(false)}
            >
              <Shield className="h-4 w-4 text-[var(--eq-text3)]" strokeWidth={1.8} />
              Privacy policy
            </a>
            <a
              role="menuitem"
              href="/terms.html"
              target="_blank"
              rel="noopener noreferrer"
              className={itemClass}
              onClick={() => setOpen(false)}
            >
              <FileText className="h-4 w-4 text-[var(--eq-text3)]" strokeWidth={1.8} />
              Terms of service
            </a>
          </div>

          <div className="border-t border-[var(--eq-border)] pt-1">
            <button
              type="button"
              role="menuitem"
              className={`${itemClass} !text-[var(--eq-loss)] hover:!bg-[var(--eq-loss-soft)]`}
              onClick={() => {
                setOpen(false);
                onSignOut();
              }}
            >
              <LogOut className="h-4 w-4" strokeWidth={1.8} />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Header({
  activeTab,
  setActiveTab,
  user,
  onSignIn,
  onSignUp,
  onSignOut,
  onOpenLearn,
}) {
  const handleTab = (id) => {
    setActiveTab(id);
    const path = TAB_PATHS[id];
    if (path && window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }
  };

  const openSearch = () => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true, ctrlKey: true }));
  };

  const navItem = (tab, compact = false) => {
    const active = activeTab === tab.id;
    return (
      <button
        key={tab.id}
        type="button"
        onClick={() => handleTab(tab.id)}
        aria-current={active ? 'page' : undefined}
        className={`group relative flex items-center rounded-xl transition-all ${
          compact ? 'px-3 py-2' : 'min-w-[122px] px-3.5 py-2'
        } ${
          active
            ? 'bg-[var(--eq-card)] text-[var(--eq-text)] shadow-[var(--eq-shadow-card)] ring-1 ring-[var(--eq-border)]'
            : 'text-[var(--eq-text3)] hover:bg-[var(--eq-card)]/70 hover:text-[var(--eq-text2)]'
        }`}
      >
        <span className="text-left">
          <span className={`block whitespace-nowrap font-semibold ${compact ? 'text-[11.5px]' : 'text-[12.5px]'}`}>
            {compact ? tab.short : tab.label}
          </span>
          {!compact && (
            <span className="mt-0.5 block whitespace-nowrap text-[9.5px] font-medium text-[var(--eq-text3)]">
              {tab.hint}
            </span>
          )}
        </span>
        {active && !compact && (
          <span className="absolute inset-y-2 left-0 w-[2px] rounded-full bg-[var(--eq-accent)]" />
        )}
      </button>
    );
  };

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--eq-border)] bg-[color-mix(in_srgb,var(--eq-bg)_86%,transparent)] backdrop-blur-xl">
      <div className="mx-auto max-w-[1680px] px-3 sm:px-6">
        <div className="flex h-[58px] items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => handleTab('research')}
            className="flex shrink-0 items-center gap-2.5 rounded-xl px-1 py-1 text-left transition hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--eq-accent)]"
            aria-label="Go to Research"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-[var(--eq-border)] bg-[var(--eq-card)] shadow-[var(--eq-shadow-card)]">
              <img src="/logo-mark.svg" alt="" width={21} height={21} className="h-[21px] w-[21px]" aria-hidden />
            </span>
            <span>
              <span className="block text-[14.5px] font-semibold tracking-tight text-[var(--eq-text)]">Equilima</span>
              <span className="hidden text-[9.5px] font-medium uppercase tracking-[0.12em] text-[var(--eq-text3)] xl:block">
                Research workspace
              </span>
            </span>
          </button>

          <nav aria-label="Workspace" className="hidden items-center gap-1 rounded-2xl border border-[var(--eq-border)] bg-[var(--eq-card2)] p-1 lg:flex">
            {TABS.map((tab) => navItem(tab))}
          </nav>

          <div className="relative z-[200] flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={openSearch}
            aria-label="Search symbols and actions"
              className="hidden h-9 items-center gap-2 rounded-xl border border-[var(--eq-border)] bg-[var(--eq-card)] px-3 text-[11px] font-medium text-[var(--eq-text2)] shadow-[var(--eq-shadow-card)] transition-all hover:border-[var(--eq-border2)] hover:text-[var(--eq-text)] lg:flex"
              title="Search symbols and actions"
            >
              <Search className="h-3.5 w-3.5 text-[var(--eq-text3)]" strokeWidth={1.8} />
              Search
              <kbd className="ml-1 rounded-md border border-[var(--eq-border)] bg-[var(--eq-card2)] px-1.5 py-0.5 font-[inherit] text-[9px] text-[var(--eq-text3)]">
                ⌘K
              </kbd>
            </button>

            {onOpenLearn && (
              <button
                type="button"
                onClick={onOpenLearn}
                className="hidden h-9 items-center gap-1.5 rounded-xl px-2.5 text-[11.5px] font-medium text-[var(--eq-text3)] transition-colors hover:bg-[var(--eq-card)] hover:text-[var(--eq-text2)] lg:flex"
              >
                <BookOpen className="h-3.5 w-3.5" strokeWidth={1.8} />
                Learn
              </button>
            )}

            <ThemeButton />

            {user ? (
              <UserMenu user={user} setActiveTab={setActiveTab} onSignOut={onSignOut} />
            ) : (
              <>
                <button
                  type="button"
                  onClick={onSignIn}
                  className="flex h-9 items-center rounded-xl px-2 text-xs font-medium text-[var(--eq-text2)] transition-colors hover:bg-[var(--eq-card)] hover:text-[var(--eq-text)]"
                >
                  Sign in
                </button>
                <button
                  type="button"
                  onClick={onSignUp}
                  className="flex h-9 items-center rounded-xl bg-[var(--eq-text)] px-2.5 sm:px-3.5 text-xs font-semibold text-[var(--eq-bg)] shadow-sm transition-opacity hover:opacity-85"
                >
                  Sign up
                </button>
              </>
            )}
          </div>
        </div>

        <nav aria-label="Workspace" className="no-scrollbar flex items-center gap-1 overflow-x-auto border-t border-[var(--eq-border)] py-1.5 lg:hidden">
          {TABS.map((tab) => navItem(tab, true))}
          {onOpenLearn && (
            <button type="button" onClick={onOpenLearn} aria-label="Learn" title="Learn"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[var(--eq-text2)] hover:bg-[var(--eq-card)]">
              <BookOpen className="h-4 w-4" strokeWidth={1.8} />
            </button>
          )}
          <button
            type="button"
            onClick={openSearch}
            aria-label="Search symbols and actions"
            className="ml-auto flex h-8 shrink-0 items-center gap-1.5 rounded-xl border border-[var(--eq-border)] bg-[var(--eq-card)] px-2.5 text-[11px] font-medium text-[var(--eq-text2)]"
          >
            <Search className="h-3.5 w-3.5" strokeWidth={1.8} />
            <span className="hidden sm:inline">Search</span>
          </button>
        </nav>
      </div>
    </header>
  );
}
