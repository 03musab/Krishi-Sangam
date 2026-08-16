import InfoPage, { InfoBlock, InfoP } from '../components/InfoPage';
import { useLanguage } from '../i18n/LanguageContext';

export default function ForFarmers() {
  const { t } = useLanguage();
  return (
    <InfoPage
      title={t('farmers.title')}
      subtitle={t('farmers.subtitle')}
      actions={[
        { label: t('farmers.cta'), view: 'services', primary: true }
      ]}
    >
      <InfoBlock title="Find Agricultural Land">
        <InfoP>Discover agricultural land available for lease according to your requirements.</InfoP>
      </InfoBlock>

      <InfoBlock title="Rent Agricultural Equipment">
        <InfoP>Find tractors, machinery and other agricultural equipment available for rental.</InfoP>
      </InfoBlock>

      <InfoBlock title="Find Agricultural Services">
        <InfoP>Connect with service providers offering farm labour, spraying, sowing, harvesting and other agricultural services.</InfoP>
      </InfoBlock>

      <InfoBlock title="Connect Directly">
        <InfoP>Send enquiries and communicate with relevant landowners, equipment owners and service providers.</InfoP>
      </InfoBlock>

      <InfoBlock title="Manage Your Requirements">
        <InfoP>Keep your requirements organized and find suitable agricultural resources through the platform.</InfoP>
      </InfoBlock>
    </InfoPage>
  );
}
