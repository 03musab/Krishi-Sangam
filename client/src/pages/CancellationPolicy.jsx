import InfoPage, { InfoBlock, InfoP, InfoList } from '../components/InfoPage';
import { useLanguage } from '../i18n/LanguageContext';

export default function CancellationPolicy() {
  const { t } = useLanguage();
  return (
    <InfoPage title={t('cancellation.title')} subtitle={t('cancellation.subtitle')}>
      <InfoBlock title="1. Standard Land Listing Cancellation">
        <InfoP>Standard land listings are free of cost. A landowner may:</InfoP>
        <InfoList items={[
          'Edit the listing',
          'Temporarily deactivate the listing',
          'Remove the listing',
          'Mark the land as unavailable'
        ]} />
        <InfoP>Since the standard listing is free, no listing fee refund is applicable.</InfoP>
      </InfoBlock>

      <InfoBlock title="2. Priority Listing Cancellation">
        <InfoP>Priority Listing is an optional paid visibility feature.</InfoP>
        <InfoList items={[
          'A landowner may request removal or cancellation of a Priority Listing.',
          'Once the Priority Listing has been activated and the promotional visibility has been provided, the Priority Listing fee is generally non-refundable.',
          'Cancellation of the underlying land lease enquiry does not automatically cancel or refund the Priority Listing fee.',
          'If Krishi Sangam is unable to provide the purchased Priority Listing service due to a platform-related issue attributable to Krishi Sangam, the applicable fee may be refunded or adjusted.'
        ]} />
      </InfoBlock>

      <InfoBlock title="3. Cancellation by Farmer / Customer">
        <InfoP>A farmer or customer may request cancellation of:</InfoP>
        <InfoList items={[
          'An agricultural service request',
          'Equipment rental',
          'A land-related enquiry',
          'A proposed land transaction'
        ]} />
        <InfoP>Cancellation before confirmation or commencement may generally be easier to process. Once a service, rental or agreement has commenced, cancellation may be subject to the terms agreed between the parties.</InfoP>
      </InfoBlock>

      <InfoBlock title="4. Cancellation by Service Provider">
        <InfoP>An agricultural service provider should cancel a confirmed service only when reasonably necessary. Repeated cancellations, failure to honour confirmed commitments or misuse of the platform may affect the provider&apos;s account or ability to receive future enquiries.</InfoP>
      </InfoBlock>

      <InfoBlock title="5. Cancellation by Equipment Owner">
        <InfoP>Equipment owners should ensure that listed equipment is available for the period specified. If an equipment owner cancels a confirmed rental before commencement, the customer may be eligible for an applicable refund. Repeated cancellations may affect the equipment owner&apos;s account or listing visibility.</InfoP>
      </InfoBlock>

      <InfoBlock title="6. Cancellation by Landowner">
        <InfoP>Landowners should keep their land listing information and availability accurate. If a landowner withdraws a confirmed arrangement, the parties may be required to follow the terms of that arrangement.</InfoP>
      </InfoBlock>

      <InfoBlock title="7. Cancellation After Commencement">
        <InfoP>Once a service, rental or lease arrangement has commenced:</InfoP>
        <InfoList items={[
          'Cancellation may be subject to the terms agreed between the parties.',
          'Refunds, if any, will depend on the circumstances and applicable terms.',
          'Krishi Sangam may review disputes where necessary.'
        ]} />
      </InfoBlock>

      <InfoBlock title="8. Cancellation Due to Unavoidable Circumstances">
        <InfoP>Agricultural activities may be affected by:</InfoP>
        <InfoList items={[
          'Weather',
          'Field conditions',
          'Equipment breakdown',
          'Natural events',
          'Government restrictions',
          'Other circumstances outside reasonable control'
        ]} />
        <InfoP>In such situations, Krishi Sangam may assist the parties in finding a suitable resolution.</InfoP>
      </InfoBlock>
    </InfoPage>
  );
}
