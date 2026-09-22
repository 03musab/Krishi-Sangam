import { useState, useEffect } from 'react';
import BookingCard from './BookingCard';
import FarmLocationField from './FarmLocationField';
import AreaField from './AreaField';
import SmartFarmSelector from './SmartFarmSelector';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../i18n/LanguageContext';
import { bookServiceSmart } from '../lib/api';
import { SERVICE_CATEGORIES, SERVICE_QUESTIONS } from '../data/services';
import Icon from './Icon';

const DYNAMIC_OPTIONS = {
  'svc.q.yesNo': ['svc.q.yes', 'svc.q.no'],
  'svc.q.fieldCondition.options': ['svc.q.fcFlat', 'svc.q.fcTerraced', 'svc.q.fcRocky', 'svc.q.fcMarshy'],
  'svc.q.waterSource.options': ['svc.q.wsWell', 'svc.q.wsBorewell', 'svc.q.wsCanal', 'svc.q.wsPond', 'svc.q.wsRiver', 'svc.q.wsTanker'],
  'svc.q.seedSource.options': ['svc.q.ssOwn', 'svc.q.ssSupplier', 'svc.q.ssGovt'],
  'svc.q.severity.options': ['svc.q.sevLow', 'svc.q.sevMedium', 'svc.q.sevHigh'],
  'svc.q.areaExtent.options': ['svc.q.aeSmall', 'svc.q.aeMedium', 'svc.q.aeLarge', 'svc.q.aeEntire'],
  'svc.q.currentIrrigation.options': ['svc.q.ciFlood', 'svc.q.ciDrip', 'svc.q.ciSprinkler', 'svc.q.ciRainfed', 'svc.q.ciNone'],
  'svc.q.moistureLevel.options': ['svc.q.mlDry', 'svc.q.mlOptimal', 'svc.q.mlWet'],
  'svc.q.gradeRequired.options': ['svc.q.grPremium', 'svc.q.grStandard', 'svc.q.grAny'],
  'svc.q.packagingType.options': ['svc.q.ptSacks', 'svc.q.ptCrates', 'svc.q.ptBoxes', 'svc.q.ptBags', 'svc.q.ptOther'],
  'svc.q.pumpType.options': ['svc.q.ptSubmersible', 'svc.q.ptCentrifugal', 'svc.q.ptJet', 'svc.q.ptOther'],
  'svc.q.testPurpose.options': ['svc.q.tpGeneral', 'svc.q.tpNutrients', 'svc.q.tpPH', 'svc.q.tpContamination']
};

export default function ServiceBookingForm({ category, service, onBack, onSubmitted }) {
  const { showToast } = useToast();
  const { t } = useLanguage();

  const [selectedCatId, setSelectedCatId] = useState(category?.id || SERVICE_CATEGORIES[0].id);
  const [selectedServiceName, setSelectedServiceName] = useState(
    service?.name || category?.services?.[0]?.name || SERVICE_CATEGORIES[0].services[0].name
  );

  useEffect(() => {
    if (category?.id) setSelectedCatId(category.id);
  }, [category?.id]);

  useEffect(() => {
    if (service?.name) setSelectedServiceName(service.name);
  }, [service?.name]);

  const activeCategory = SERVICE_CATEGORIES.find((c) => c.id === selectedCatId) || category || SERVICE_CATEGORIES[0];
  const activeService = activeCategory.services?.find((s) => s.name === selectedServiceName) || activeCategory.services?.[0] || service || SERVICE_CATEGORIES[0].services[0];

  const handleCategoryChange = (e) => {
    const newCatId = e.target.value;
    setSelectedCatId(newCatId);
    const newCat = SERVICE_CATEGORIES.find((c) => c.id === newCatId);
    if (newCat && newCat.services?.length) {
      setSelectedServiceName(newCat.services[0].name);
    }
  };

  const handleServiceChange = (e) => {
    setSelectedServiceName(e.target.value);
  };

  const [farmFor, setFarmFor] = useState('my_farm');
  const [farmDetails, setFarmDetails] = useState('');

  const [form, setForm] = useState({
    start_date: '',
    location: '',
    description: '',
    num_workers: '',
    area_acres: ''
  });
  const [coords, setCoords] = useState(null);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  // Resolve service-specific questions dynamically based on activeService
  const questions = SERVICE_QUESTIONS[activeService.name] || [];

  const handleSubmit = async () => {
    try {
      // Build a rich description from service-specific answers
      const answers = [];
      for (const q of questions) {
        const val = form[`q_${q.key}`];
        if (val) {
          const label = t(q.label, q.label);
          answers.push(`${label}: ${val}`);
        }
      }
      if (form.area_acres) {
        answers.unshift(t('labour.fieldSizeNote', { a: form.area_acres }));
      }

      await bookServiceSmart({
        category: activeCategory.name,
        service_name: activeService.name,
        start_date: form.start_date || null,
        location: form.location,
        lat: coords?.lat,
        lng: coords?.lng,
        num_workers: form.num_workers ? Number(form.num_workers) : null,
        service_details: [
          ...answers,
          form.description
        ].filter(Boolean).join(' • ') || null,
        farm_for: farmFor,
        farm_details: farmDetails
      });

      showToast(t('labour.serviceSubmitted', 'Service request sent to 25km matching providers!'));
      if (onSubmitted) onSubmitted();
    } catch (err) {
      showToast(t('common.error', { msg: err.message }));
    }
  };

  return (
    <BookingCard
      title={t(`svc.${activeService.name}.name`, activeService.name)}
      subtitle={
        <>
          <Icon name={activeCategory.icon} size={16} style={{ verticalAlign: '-3px', marginRight: '6px' }} />
          {t(`cat.${activeCategory.id}.name`, activeCategory.name)}
        </>
      }
      icon={activeCategory.icon}
      onBack={onBack}
      onSubmitted={onSubmitted}
      submitLabel={t('labour.requestService', 'Request Agricultural Service')}
      onSubmit={handleSubmit}
    >
      {/* ── STEP 1: Smart Farm Selector ("Who is this for?") ── */}
      <SmartFarmSelector
        farmFor={farmFor}
        setFarmFor={setFarmFor}
        farmDetails={farmDetails}
        setFarmDetails={setFarmDetails}
      />

      {/* ── Service Selection Dropdowns ── */}
      <div style={{
        background: '#f8fafc',
        border: '1.5px solid #e2e8f0',
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '18px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            🛠️ {t('labour.selectedService', 'Selected Agricultural Service')}
          </span>
        </div>

        <div className="form-grid-row" style={{ gap: '12px', marginBottom: '10px' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontSize: '12.5px', fontWeight: 600 }}>
              {t('labour.serviceCategory', 'Service Category')}
            </label>
            <select
              className="form-select"
              value={activeCategory.id}
              onChange={handleCategoryChange}
              style={{ fontWeight: 600 }}
            >
              {SERVICE_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {t(`cat.${c.id}.name`, c.name)}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontSize: '12.5px', fontWeight: 600 }}>
              {t('labour.specificService', 'Specific Service')}
            </label>
            <select
              className="form-select"
              value={activeService.name}
              onChange={handleServiceChange}
              style={{ fontWeight: 600 }}
            >
              {activeCategory.services.map((s) => (
                <option key={s.name} value={s.name}>
                  {t(`svc.${s.name}.name`, s.name)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <p style={{ margin: '6px 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>
          {t(`svc.${activeService.name}.desc`, activeService.desc)}
        </p>
      </div>

      {/* ── Service-Specific Questions ── */}
      {questions.length > 0 && (
        <div className="service-specific-questions" style={{ marginBottom: '16px', background: '#ffffff', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <h4 className="svc-q-heading" style={{ margin: '0 0 12px 0', color: '#0f172a', fontSize: '0.95rem' }}>
            📋 {t('svc.q.heading', 'Service-Specific Details')}
          </h4>
          {questions.map((q) => {
            const fieldKey = `q_${q.key}`;
            const label = t(q.label, q.label);

            if (q.type === 'select') {
              const opts = q.options
                ? q.options
                : (DYNAMIC_OPTIONS[q.optionsKey] || []).map((k) => t(k, k));

              return (
                <div key={q.key} className="form-group" style={{ marginBottom: '12px' }}>
                  <label className="form-label" style={{ fontWeight: '600' }}>
                    {label}{q.required ? ' *' : ''}
                  </label>
                  <select
                    className="form-select"
                    value={form[fieldKey] || ''}
                    onChange={set(fieldKey)}
                    required={q.required}
                  >
                    <option value="">{t('svc.q.selectPlaceholder', 'Select Option')}</option>
                    {opts.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              );
            }

            if (q.type === 'textarea') {
              return (
                <div key={q.key} className="form-group" style={{ marginBottom: '12px' }}>
                  <label className="form-label" style={{ fontWeight: '600' }}>
                    {label}{q.required ? ' *' : ''}
                  </label>
                  <textarea
                    className="form-textarea"
                    placeholder={q.placeholder ? t(q.placeholder, q.placeholder) : ''}
                    value={form[fieldKey] || ''}
                    onChange={set(fieldKey)}
                    required={q.required}
                  />
                </div>
              );
            }

            return (
              <div key={q.key} className="form-group" style={{ marginBottom: '12px' }}>
                <label className="form-label" style={{ fontWeight: '600' }}>
                  {label}{q.required ? ' *' : ''}
                </label>
                <input
                  type={q.type}
                  className="form-input"
                  min={q.type === 'number' ? '1' : undefined}
                  placeholder={q.placeholder ? t(q.placeholder, q.placeholder) : ''}
                  value={form[fieldKey] || ''}
                  onChange={set(fieldKey)}
                  required={q.required}
                />
              </div>
            );
          })}
        </div>
      )}

      {/* ── Common fields ── */}
      <div className="form-group">
        <label className="form-label">{t('labour.prefDateTime', 'Preferred Date & Time')}</label>
        <input type="datetime-local" className="form-input" value={form.start_date} onChange={set('start_date')} />
      </div>

      <div className="form-grid-row">
        <div className="form-group">
          <label className="form-label">{t('labour.estLabour', 'Est. Workers Required')}</label>
          <input type="number" className="form-input" min="1" placeholder={t('labour.estLabourPh', 'e.g. 2')} value={form.num_workers} onChange={set('num_workers')} />
        </div>
        <AreaField
          label={t('labour.fieldSize', 'Farm / Field Size')}
          value={form.area_acres}
          onChange={(v) => setForm({ ...form, area_acres: v })}
        />
      </div>

      <FarmLocationField value={form.location} onChange={(v) => setForm({ ...form, location: v })} onCoords={setCoords} />

      <div className="form-group">
        <label className="form-label">{t('labour.details', 'Additional Notes')}</label>
        <textarea className="form-textarea" placeholder={t('labour.detailsPh', 'Any specific instructions for the service provider...')} value={form.description} onChange={set('description')} />
      </div>
    </BookingCard>
  );
}
