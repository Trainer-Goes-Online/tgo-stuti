'use client';

import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';

import { COUNTRIES, POPULAR_ISO, countryByIso, type Country } from '@/lib/countries';

/**
 * The phone field's country-code picker, in the quiz's own skin.
 *
 * A button showing "IN +91" opens a searchable list (name, ISO code or dial
 * code). Popular countries are pinned on top. Keyboard: ↑/↓ move, Enter
 * picks, Esc closes the list only (not the quiz dialog), Tab closes.
 *
 * The list is position: fixed against the button, so the modal card's
 * rounded overflow cannot clip it, and it opens upward when the space below
 * is short. It follows the field on scroll and resize (a phone keyboard
 * opening does both), and closes on a tap outside, Esc or Tab.
 */

const POPULAR = POPULAR_ISO.map((iso) => countryByIso(iso)!).filter(Boolean);
const REST = COUNTRIES.filter((c) => !(POPULAR_ISO as readonly string[]).includes(c.iso));

const LIST_MAX = 280;

export function CountrySelect({ value, onChange }: { value: string; onChange: (iso: string) => void }) {
  const selected = countryByIso(value) ?? POPULAR[0];
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const [pos, setPos] = useState<{ left: number; top?: number; bottom?: number; width: number } | null>(null);
  const btn = useRef<HTMLButtonElement>(null);
  const search = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const listId = useId();

  const items = useMemo<{ c: Country; group?: string }[]>(() => {
    const q = query.trim().toLowerCase().replace(/^\+/, '');
    if (!q) {
      return [
        ...POPULAR.map((c, i) => ({ c, group: i === 0 ? 'Popular' : undefined })),
        ...REST.map((c, i) => ({ c, group: i === 0 ? 'All countries' : undefined })),
      ];
    }
    return COUNTRIES.filter(
      (c) => c.name.toLowerCase().includes(q) || c.iso.toLowerCase() === q || c.dial.startsWith(q),
    ).map((c) => ({ c }));
  }, [query]);

  /* place the list under (or over) the field; re-run on scroll and resize */
  const place = () => {
    if (!btn.current) return;
    const field = btn.current.closest('.sdp-quiz-tel') ?? btn.current;
    const r = field.getBoundingClientRect();
    const vh = window.visualViewport?.height ?? window.innerHeight;
    const width = Math.min(Math.max(r.width, 280), window.innerWidth - 24);
    const left = Math.max(12, Math.min(r.left, window.innerWidth - width - 12));
    const below = vh - r.bottom;
    setPos(
      below >= LIST_MAX + 16 || below >= r.top
        ? { left, top: r.bottom + 6, width }
        : { left, bottom: window.innerHeight - r.top + 6, width },
    );
  };
  useLayoutEffect(() => {
    if (open) place();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setQuery('');
    const i = items.findIndex((x) => x.c.iso === selected.iso);
    setActive(i < 0 ? 0 : i);
    const t = window.setTimeout(() => search.current?.focus(), 10);
    const inPop = (n: EventTarget | null) => !!n && !!list.current?.parentElement?.contains(n as Node);
    /* Follow the field rather than closing: on phones the keyboard opening
       resizes and scrolls the sheet, and the list's own scroll must not count. */
    const onScroll = (e: Event) => {
      if (!inPop(e.target)) place();
    };
    const onResize = () => place();
    const onDown = (e: PointerEvent) => {
      if (!inPop(e.target) && !btn.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener('resize', onResize);
    window.visualViewport?.addEventListener('resize', onResize);
    window.addEventListener('scroll', onScroll, true);
    document.addEventListener('pointerdown', onDown, true);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener('resize', onResize);
      window.visualViewport?.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onScroll, true);
      document.removeEventListener('pointerdown', onDown, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  /* keep the highlighted row in view */
  useEffect(() => {
    if (!open) return;
    list.current?.querySelector<HTMLElement>(`[data-i="${active}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [active, open]);

  const pick = (c: Country) => {
    onChange(c.iso);
    setOpen(false);
    btn.current?.focus();
  };

  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, items.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const it = items[active];
      if (it) pick(it.c);
    } else if (e.key === 'Escape') {
      /* close the list, not the whole quiz dialog */
      e.preventDefault();
      e.stopPropagation();
      setOpen(false);
      btn.current?.focus();
    } else if (e.key === 'Tab') {
      setOpen(false);
    }
  };

  return (
    <>
      <button
        ref={btn}
        type="button"
        className="sdp-cc-btn"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-label={`Country code: ${selected.name} +${selected.dial}. Change`}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => {
          if (!open && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
            e.preventDefault();
            setOpen(true);
          }
        }}
      >
        <span className="iso">{selected.iso}</span>
        <span className="dial">+{selected.dial}</span>
        <svg className="chev" width="10" height="10" viewBox="0 0 10 10" aria-hidden>
          <path d="M2 3.5 5 6.5 8 3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && pos && (
        <div
          className="sdp-cc-pop"
          style={{ left: pos.left, top: pos.top, bottom: pos.bottom, width: pos.width, maxHeight: LIST_MAX }}
          onKeyDown={onKey}
        >
          <div className="sdp-cc-search">
            <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden>
              <circle cx="7" cy="7" r="5" fill="none" stroke="currentColor" strokeWidth="1.6" />
              <path d="m11 11 3.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            <input
              ref={search}
              value={query}
              placeholder="Search country or code"
              aria-label="Search country or code"
              aria-controls={listId}
              aria-activedescendant={items[active] ? `${listId}-${items[active].c.iso}` : undefined}
              onChange={(e) => {
                setQuery(e.target.value);
                setActive(0);
              }}
            />
          </div>
          <ul ref={list} id={listId} role="listbox" className="sdp-cc-list" aria-label="Country code">
            {items.length === 0 && <li className="sdp-cc-empty">No matching country</li>}
            {items.map(({ c, group }, i) => (
              <li key={`${group ?? ''}${c.iso}`} role="presentation">
                {group && <span className="sdp-cc-group">{group}</span>}
                <div
                  id={`${listId}-${c.iso}`}
                  role="option"
                  aria-selected={c.iso === selected.iso}
                  data-i={i}
                  className={`sdp-cc-opt${i === active ? ' is-active' : ''}`}
                  onPointerMove={() => setActive(i)}
                  onClick={() => pick(c)}
                >
                  <span className="iso">{c.iso}</span>
                  <span className="nm">{c.name}</span>
                  <span className="dial">+{c.dial}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
