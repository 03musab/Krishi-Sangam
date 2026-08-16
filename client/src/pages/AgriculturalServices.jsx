import InfoPage, { InfoBlock, InfoP, InfoList } from '../components/InfoPage';
import { useLanguage } from '../i18n/LanguageContext';

const STEPS = [
  { num: '1', title: 'Choose the Service', body: 'Select the agricultural service you need.' },
  { num: '2', title: 'Submit Your Requirement', body: 'Provide details such as location, type of work, farm requirements, preferred date, area/quantity of work and other relevant requirements.' },
  { num: '3', title: 'Connect with a Service Provider', body: 'Find or receive relevant service-provider enquiries based on your requirement.' },
  { num: '4', title: 'Discuss and Proceed', body: 'Discuss pricing, timing, requirements and other terms with the service provider and proceed with the agreed arrangement.' }
];

export default function AgriculturalServices() {
  const { t } = useLanguage();
  return (
    <InfoPage
      title={t('agriServices.title')}
      subtitle={t('agriServices.subtitle')}
      actions={[
        { label: t('agriServices.cta'), view: 'labour', primary: true },
        { label: t('agriServices.ctaSecondary'), view: 'list-labour' }
      ]}
    >
      <InfoBlock title="Services Available">
        <InfoP>Farmers can use Krishi Sangam to find services such as:</InfoP>
        <InfoList items={[
          'Farm labour',
          'Spraying',
          'Sowing',
          'Harvesting',
          'Tractor services',
          'Machinery operations',
          'Cultivation services',
          'Soil preparation',
          'Irrigation-related services',
          'Other farm-related services'
        ]} />
      </InfoBlock>

      <InfoBlock title="How It Works for Farmers">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {STEPS.map((s) => (
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

      <InfoBlock title="For Service Providers">
        <InfoP>Agricultural service providers can use Krishi Sangam to:</InfoP>
        <InfoList items={[
          'Showcase their services',
          'Reach potential farmers',
          'Receive relevant enquiries',
          'Manage availability',
          'Display service information',
          'Expand their customer network'
        ]} />
      </InfoBlock>
    </InfoPage>
  );
}
