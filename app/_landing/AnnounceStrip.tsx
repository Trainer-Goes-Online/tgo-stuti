/**
 * BEAT 0a · announcement strip (§11, page chrome).
 * "17+ Years of Experience | 1000+ People Guided Globally", verbatim, each
 * figure lifted into a chip. Rendered twice: the second run is the seamless
 * loop for the phone marquee, hidden on desktop and from AT.
 */
const ITEMS = [
  { num: '17+', post: 'Years of Experience' },
  { num: '1000+', post: 'People Guided Globally' },
] as const;

function Run() {
  return (
    <span className="sdp-announce-copy">
      {ITEMS.map((it, i) => (
        <span className="sdp-announce-item" key={it.num}>
          {i > 0 && (
            <span className="sdp-announce-sep" aria-hidden>
              |
            </span>
          )}
          <b className="sdp-announce-num">{it.num}</b>
          <span className="sdp-announce-label">{it.post}</span>
        </span>
      ))}
    </span>
  );
}

export function AnnounceStrip() {
  return (
    <div className="sdp-announce" role="note">
      <span className="sdp-announce-dot" aria-hidden />
      <span className="sdp-announce-track">
        <Run />
        <span className="sdp-announce-dup" aria-hidden>
          <Run />
        </span>
      </span>
    </div>
  );
}
