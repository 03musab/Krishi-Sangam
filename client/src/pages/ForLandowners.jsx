import InfoPage, { InfoBlock, InfoP, InfoList, InfoCard } from '../components/InfoPage';
import { useLanguage } from '../i18n/LanguageContext';

export default function ForLandowners() {
  const { t } = useLanguage();
  return (
    <InfoPage
      title={t('landowners.title')}
      subtitle={t('landowners.subtitle')}
      actions={[
        { label: t('landowners.cta'), view: 'list-land', primary: true },
        { label: t('landowners.ctaSecondary'), view: 'list-land' }
      ]}
    >
      <InfoBlock title="Choose Your Listing Option">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <InfoCard title="Standard Listing" badge="Free of Cost" accent="var(--green-mid)">
            <InfoP>List your agricultural land on Krishi Sangam without paying a listing fee. You can provide details such as:</InfoP>
            <InfoList items={[
              'Land location',
              'Land area',
              'Type of agricultural land',
              'Water availability',
              'Available facilities',
              'Farming suitability',
              'Lease expectations',
              'Availability period',
              'Images and other relevant details'
            ]} />
          </InfoCard>
          <InfoCard title="Priority Listing" badge="Paid Enhanced Visibility" accent="var(--accent-gold)">
            <InfoP>Priority Listing is an optional paid feature designed to provide enhanced visibility to your land listing. It can help your listing receive greater visibility compared with a standard listing, subject to the platform&apos;s listing and ranking system.</InfoP>
            <InfoP>The Priority Listing fee is separate from the actual lease/rent amount.</InfoP>
          </InfoCard>
        </div>
      </InfoBlock>

      <InfoBlock title="Reach Potential Farmers">
        <InfoP>Make your agricultural land visible to farmers looking for land in suitable locations.</InfoP>
      </InfoBlock>

      <InfoBlock title="Receive Enquiries">
        <InfoP>Interested farmers can contact you regarding your land listing.</InfoP>
      </InfoBlock>

      <InfoBlock title="Manage Your Listing">
        <InfoP>You can keep your land information, availability and listing status updated.</InfoP>
      </InfoBlock>

      <InfoBlock title="Connect with Potential Tenants">
        <InfoP>Communicate with interested farmers and discuss the proposed lease terms.</InfoP>
      </InfoBlock>

      <InfoBlock title="Important">
        <InfoP>Krishi Sangam provides the digital platform for listing and connecting landowners with potential farmers.</InfoP>
        <InfoP>Landowners are responsible for providing accurate information about their land. Final lease terms, rent, security deposits, documentation, verification and legal arrangements should be mutually agreed upon by the concerned parties.</InfoP>
      </InfoBlock>
    </InfoPage>
  );
}
