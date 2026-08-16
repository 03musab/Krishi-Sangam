import InfoPage, { InfoBlock, InfoP, InfoList } from '../components/InfoPage';
import { useLanguage } from '../i18n/LanguageContext';

export default function ForEquipmentOwners() {
  const { t } = useLanguage();
  return (
    <InfoPage
      title={t('equipmentOwners.title')}
      subtitle={t('equipmentOwners.subtitle')}
      actions={[
        { label: t('equipmentOwners.cta'), view: 'list-equipment', primary: true }
      ]}
    >
      <InfoBlock title="List Your Equipment">
        <InfoP>Create an equipment listing with details such as:</InfoP>
        <InfoList items={[
          'Equipment type',
          'Brand and model',
          'Location',
          'Availability',
          'Rental rate, where applicable',
          'Relevant specifications',
          'Images',
          'Operating requirements'
        ]} />
      </InfoBlock>

      <InfoBlock title="Reach Farmers">
        <InfoP>Make your equipment visible to farmers looking for agricultural machinery.</InfoP>
      </InfoBlock>

      <InfoBlock title="Manage Availability">
        <InfoP>Keep your equipment availability updated and respond to relevant enquiries.</InfoP>
      </InfoBlock>

      <InfoBlock title="Build Your Equipment Business">
        <InfoP>Use your existing equipment to reach more potential customers and generate additional rental opportunities.</InfoP>
      </InfoBlock>

      <InfoBlock title="Equipment You Can List">
        <InfoP>Examples include:</InfoP>
        <InfoList items={[
          'Tractors',
          'Rotavators',
          'Cultivators',
          'Seeders',
          'Harvesting equipment',
          'Sprayers',
          'Tillers',
          'Threshers',
          'Ploughs',
          'Other agricultural machinery'
        ]} />
      </InfoBlock>

      <InfoBlock title="Important">
        <InfoP>Equipment owners are responsible for providing accurate equipment information and ensuring that the equipment is safe, operational and suitable for the stated use.</InfoP>
        <InfoP>Final rental terms, pricing, usage conditions, transportation and other arrangements should be mutually agreed upon by the concerned parties.</InfoP>
      </InfoBlock>
    </InfoPage>
  );
}
