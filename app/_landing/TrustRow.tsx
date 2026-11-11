import { CheckCircleIcon, StarIcon } from './icons';

/**
 * BEAT 0b · trust row (§12, hairline chip row).
 * "5.0 ⭐ Client Rating | 100% Customer Satisfaction", verbatim. The copy
 * names no reviewer faces, so no avatar stack is built.
 */
export function TrustRow() {
  return (
    <div className="sdp-trust-strip">
      <div className="sdp-trust-item">
        <b>5.0</b>
        <span className="sdp-trust-stars" aria-hidden>
          {[0, 1, 2, 3, 4].map((i) => (
            <StarIcon key={i} size={13} />
          ))}
        </span>
        <span>Client Rating</span>
      </div>

      <span className="sdp-trust-sep" aria-hidden />

      <div className="sdp-trust-item">
        <span className="sdp-trust-check" aria-hidden>
          <CheckCircleIcon />
        </span>
        <span>
          <b>100%</b> Customer Satisfaction
        </span>
      </div>
    </div>
  );
}
