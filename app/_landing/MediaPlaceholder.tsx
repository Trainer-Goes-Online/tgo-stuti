import { FilmGlyph, ImageGlyph, TextGlyph } from './icons';

/**
 * A slot for something that does not exist yet: sized at the real asset's
 * ratio so nothing reflows when it lands, and labelled with what belongs
 * there so whoever supplies it knows the ask without opening the code.
 */
export function MediaPlaceholder({
  ratio,
  label,
  note,
  kind = 'image',
  className = '',
}: {
  /** CSS aspect-ratio of the real asset, e.g. '4 / 5'. Omit to fill the parent. */
  ratio?: string;
  label: string;
  note?: string;
  kind?: 'image' | 'film' | 'text';
  className?: string;
}) {
  const Glyph = kind === 'film' ? FilmGlyph : kind === 'text' ? TextGlyph : ImageGlyph;

  return (
    <div
      className={`sdp-ph${className ? ` ${className}` : ''}`}
      style={ratio ? { aspectRatio: ratio } : undefined}
      role="img"
      aria-label={`Placeholder: ${label}`}
    >
      <div className="sdp-ph-inner">
        <span className="sdp-ph-icon">
          <Glyph />
        </span>
        <span className="sdp-ph-label">{label}</span>
        {note && <span className="sdp-ph-note">{note}</span>}
      </div>
    </div>
  );
}
