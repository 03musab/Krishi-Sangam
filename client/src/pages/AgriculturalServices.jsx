import InfoPage, { InfoBlock, InfoP, InfoList } from '../components/InfoPage';
import { useLanguage } from '../i18n/LanguageContext';

export default function AgriculturalServices() {
  const { t } = useLanguage();

  const steps = [
    { num: '1', title: t('agriServices.step1Title'), body: t('agriServices.step1Body') },
    { num: '2', title: t('agriServices.step2Title'), body: t('agriServices.step2Body') },
    { num: '3', title: t('agriServices.step3Title'), body: t('agriServices.step3Body') },
    { num: '4', title: t('agriServices.step4Title'), body: t('agriServices.step4Body') }
  ];

  return (
    <InfoPage
      title={t('agriServices.title')}
      subtitle={t('agriServices.subtitle')}
      actions={[
        { label: t('agriServices.cta'), view: 'labour', primary: true },
        { label: t('agriServices.ctaSecondary'), view: 'list-labour' }
      ]}
    >
      <InfoBlock title={t('agriServices.availableTitle')}>
        <InfoP>{t('agriServices.availableDesc')}</InfoP>
        <InfoList items={[
          t('agriServices.s1'),
          t('agriServices.s2'),
          t('agriServices.s3'),
          t('agriServices.s4'),
          t('agriServices.s5'),
          t('agriServices.s6'),
          t('agriServices.s7'),
          t('agriServices.s8'),
          t('agriServices.s9'),
          t('agriServices.s10')
        ]} />
      </InfoBlock>

      <InfoBlock title={t('agriServices.howItWorksTitle')}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {steps.map((s) => (
            <div key={s.num} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'var(--green-mid)', color: 'white', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 12px rgba(34, 197, 94, 0.35)' }}>{s.num}</div>
              <div>
                <h4 style={{ fontSize: 'var(--fs-md)', color: 'var(--text-dark)', marginBottom: '4px' }}>{s.title}</h4>
                <p style={{ marginBottom: 0 }}>{s.body}</p>
              </div>
            </div>
          ))}
        </div>
      </InfoBlock>

      <InfoBlock title={t('agriServices.forProvidersTitle')}>
        <InfoP>{t('agriServices.forProvidersDesc')}</InfoP>
        <InfoList items={[
          t('agriServices.p1'),
          t('agriServices.p2'),
          t('agriServices.p3'),
          t('agriServices.p4'),
          t('agriServices.p5'),
          t('agriServices.p6')
        ]} />
      </InfoBlock>
    </InfoPage>
  );
}
