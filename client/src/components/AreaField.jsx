import { useEffect, useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';

// 1 hectare = 2.47105 acres  (1 acre = 0.404686 ha)
const ACRES_PER_HECTARE = 2.47105;
const HECTARES_PER_ACRE = 1 / ACRES_PER_HECTARE;

function round2(n) {
  return Math.round(n * 100) / 100;
}

/**
 * AreaField — a dual Acres ↔ Hectares input with live two-way conversion.
 * Editing either box instantly converts into the other and reports the
 * canonical value (in acres) through onChange.
 *
 * Props:
 *   value    — controlled value in acres (string or number)
 *   onChange — called with the acres value (string) whenever either box changes
 *   label    — field label text
 *   required — marks the acres input as required for form validation
 */
export default function AreaField({ value = '', onChange, label, required }) {
  const { t } = useLanguage();
  const [acres, setAcres] = useState(value === '' || value == null ? '' : String(value));
  const [hectares, setHectares] = useState('');

  // Keep both boxes in sync when the parent resets/updates the value.
  // Skip when the incoming value is merely the parent echoing our own
  // onChange back — otherwise the box the user is typing in gets clobbered.
  useEffect(() => {
    const v = value === '' || value == null ? '' : String(value);
    if (v === acres) return;
    setAcres(v);
    setHectares(v === '' ? '' : String(round2(Number(v) * HECTARES_PER_ACRE)));
  }, [value]);

  const handleAcres = (e) => {
    const v = e.target.value;
    setAcres(v);
    setHectares(v === '' ? '' : String(round2(Number(v) * HECTARES_PER_ACRE)));
    onChange(v);
  };

  const handleHectares = (e) => {
    const v = e.target.value;
    setHectares(v);
    const a = v === '' ? '' : String(round2(Number(v) * ACRES_PER_HECTARE));
    setAcres(a);
    onChange(a);
  };

  return (
    <div className="form-group">
      {label && <label className="form-label">{label}{required ? ' *' : ''}</label>}
      <div className="area-field-row">
        <div className="area-field-input">
          <input
            type="number"
            min="0"
            step="any"
            className="form-input"
            placeholder={t('field.acresPh')}
            value={acres}
            onChange={handleAcres}
            required={required}
            aria-label={t('field.acres')}
          />
          <span className="area-field-unit">{t('field.acres')}</span>
        </div>
        <span className="area-field-eq">=</span>
        <div className="area-field-input">
          <input
            type="number"
            min="0"
            step="any"
            className="form-input"
            placeholder={t('field.hectaresPh')}
            value={hectares}
            onChange={handleHectares}
            aria-label={t('field.hectares')}
          />
          <span className="area-field-unit">{t('field.hectares')}</span>
        </div>
      </div>
    </div>
  );
}
