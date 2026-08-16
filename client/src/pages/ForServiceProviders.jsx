import InfoPage, { InfoBlock, InfoP, InfoList } from '../components/InfoPage';
import { useLanguage } from '../i18n/LanguageContext';

export default function ForServiceProviders() {
  const { t } = useLanguage();
  return (
    <InfoPage
      title={t('serviceProviders.title')}
      subtitle={t('serviceProviders.subtitle')}
      actions={[
        { label: t('serviceProviders.cta'), view: 'list-labour', primary: true }
      ]}
    >
      <InfoBlock title="Get More Service Opportunities">
        <InfoP>Receive relevant enquiries from farmers looking for agricultural services in your area.</InfoP>
      </InfoBlock>

      <InfoBlock title="Reach More Farmers">
        <InfoP>Showcase your services to farmers who may require your expertise.</InfoP>
      </InfoBlock>

      <InfoBlock title="Showcase Your Services">
        <InfoP>Create your service profile and provide information about:</InfoP>
        <InfoList items={[
          'Services offered',
          'Service location',
          'Availability',
          'Pricing or rate information, where applicable',
          'Experience and relevant details'
        ]} />
      </InfoBlock>

      <InfoBlock title="Manage Your Availability">
        <InfoP>Keep your availability and service information updated so that farmers can contact you for suitable requirements.</InfoP>
      </InfoBlock>

      <InfoBlock title="Build Your Presence">
        <InfoP>A professional profile and reliable service can help you build credibility among potential customers.</InfoP>
      </InfoBlock>

      <InfoBlock title="Grow Your Business">
        <InfoP>Krishi Sangam can help service providers expand their reach beyond their existing customer network.</InfoP>
      </InfoBlock>

      <InfoBlock title="Agricultural Services You Can Offer">
        <InfoP>Depending on your capabilities, you can list:</InfoP>
        <InfoList items={[
          'Farm labour',
          'Agricultural spraying',
          'Tractor services',
          'Farm machinery operations',
          'Sowing services',
          'Harvesting services',
          'Cultivation services',
          'Irrigation-related services',
          'Soil preparation',
          'Other agricultural services'
        ]} />
      </InfoBlock>

      <InfoBlock title="Join Krishi Sangam">
        <InfoP>Register as a service provider and showcase your agricultural services to potential customers.</InfoP>
      </InfoBlock>
    </InfoPage>
  );
}
