import { INDIAN_STATES, DISTRICTS_BY_STATE, TALUKAS_BY_DISTRICT } from '../data/locations';
import { useLanguage } from '../i18n/LanguageContext';

/**
 * Cascading location fields — State first, then District, then Taluka,
 * then Village/Town. Each dropdown only shows options relevant to the
 * previous selection. If no taluka list exists for a district, a manual
 * text input is shown instead.
 *
 * `value` and `onChange` mirror the parent form's village/taluka/district/state keys.
 */
export default function LocationSelects({ value, onChange }) {
  const { t } = useLanguage();
  const state = value?.state || '';
  const district = value?.district || '';
  const taluka = value?.taluka || '';
  const village = value?.village || '';

  const districts = state ? DISTRICTS_BY_STATE[state] || [] : [];
  const talukas = district ? TALUKAS_BY_DISTRICT[district] || [] : [];
  const hasTalukas = talukas.length > 0;

  const set = (key) => (e) => onChange({ ...value, [key]: e.target.value });

  const handleState = (e) => {
    const s = e.target.value;
    onChange({ ...value, state: s, district: '', taluka: '' });
  };

  const handleDistrict = (e) => {
    const d = e.target.value;
    onChange({ ...value, district: d, taluka: '' });
  };

  return (
    <>
      <div className="form-group">
        <label className="form-label">{t('auth.state')} *</label>
        <select className="form-select" value={state} onChange={handleState} required>
          <option value="">{t('auth.selectState')}</option>
          {INDIAN_STATES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div className="form-grid-row">
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

        <div className="form-group">
          <label className="form-label">{t('auth.taluka')} *</label>
          {hasTalukas ? (
            <select className="form-select" value={taluka} onChange={set('taluka')} disabled={!district} required>
              <option value="">{t('auth.selectTaluka')}</option>
              {talukas.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              className="form-input"
              value={taluka}
              onChange={set('taluka')}
              placeholder={district ? t('auth.typeTaluka') : t('auth.selectDistrictFirst')}
              disabled={!district}
              required
            />
          )}
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">{t('auth.village')} *</label>
        <input
          type="text"
          className="form-input"
          placeholder={t('auth.enterVillage')}
          value={village}
          onChange={set('village')}
          required
        />
      </div>
    </>
  );
}
