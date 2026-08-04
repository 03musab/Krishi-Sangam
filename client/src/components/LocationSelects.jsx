import { INDIAN_STATES, DISTRICTS_BY_STATE } from '../data/locations';
import { useLanguage } from '../i18n/LanguageContext';

/**
 * Cascading location fields — State first, then District.
 * Kept intentionally minimal (just the 2 most important fields): the map
 * (FarmLocationField) handles the fine-grained village/taluka location.
 *
 * `value` and `onChange` mirror the parent form's district/state keys.
 */
export default function LocationSelects({ value, onChange }) {
  const { t } = useLanguage();
  const state = value?.state || '';
  const district = value?.district || '';

  const districts = state ? DISTRICTS_BY_STATE[state] || [] : [];

  const handleState = (e) => {
    const s = e.target.value;
    onChange({ ...value, state: s, district: '' });
  };

  const handleDistrict = (e) => {
    const d = e.target.value;
    onChange({ ...value, district: d });
  };

  return (
    <>
      <div className="form-grid-row">
        <div className="form-group">
          <label className="form-label">{t('auth.state')} *</label>
          <select className="form-select" value={state} onChange={handleState} required>
            <option value="">{t('auth.selectState')}</option>
            {INDIAN_STATES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">{t('auth.district')} *</label>
          <select
            className="form-select"
            value={district}
            onChange={handleDistrict}
            disabled={!state}
            required
          >
            <option value="">{state ? t('auth.selectDistrict') : t('auth.selectStateFirst')}</option>
            {districts.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      </div>
    </>
  );
}