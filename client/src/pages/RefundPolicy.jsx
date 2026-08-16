import InfoPage, { InfoBlock, InfoP, InfoList } from '../components/InfoPage';
import { useLanguage } from '../i18n/LanguageContext';

export default function RefundPolicy() {
  const { t } = useLanguage();
  return (
    <InfoPage title={t('refund.title')} subtitle={t('refund.subtitle')}>
      <InfoBlock title="1. Land Listings">
        <InfoP>Krishi Sangam provides two listing options for landowners:</InfoP>
        <InfoP><strong>Standard Listing</strong></InfoP>
        <InfoList items={[
          'Standard land listings are free of cost.',
          'No listing fee is charged for a standard listing.',
          'Since there is no listing fee, there is no listing fee refund applicable to a standard listing.',
          'Landowners remain responsible for the accuracy of the information provided in their listing.'
        ]} />
        <InfoP><strong>Priority Listing</strong></InfoP>
        <InfoP>Priority Listing is an optional paid promotional feature that provides enhanced visibility for an eligible land listing on Krishi Sangam. The Priority Listing fee is separate from:</InfoP>
        <InfoList items={[
          'Land lease/rent',
          'Security deposit',
          'Advance payment',
          'Documentation charges',
          'Any other amount agreed between the farmer and landowner'
        ]} />
        <InfoP><strong>Priority Listing Refunds</strong></InfoP>
        <InfoList items={[
          'Once a Priority Listing has been successfully activated and the enhanced visibility service has been provided, the Priority Listing fee is generally non-refundable.',
          'If payment has been successfully made but Krishi Sangam is unable to activate the Priority Listing because of a platform or technical issue attributable to Krishi Sangam, the applicable fee may be considered for a refund or adjustment.',
          'Cancellation of a land lease enquiry or agreement between a farmer and landowner does not automatically make the Priority Listing fee refundable.',
          'If a landowner voluntarily removes or withdraws a Priority Listing after activation, the Priority Listing fee is generally non-refundable.',
          'If Krishi Sangam removes a listing because it violates platform policies or contains misleading, fraudulent or prohibited information, the Priority Listing fee may not be refundable.'
        ]} />
      </InfoBlock>

      <InfoBlock title="2. Land Lease Transactions">
        <InfoP>Krishi Sangam primarily provides a platform for connecting farmers and landowners.</InfoP>
        <InfoList items={[
          'Refund eligibility for any transaction facilitated through the platform depends on the stage of the transaction and the applicable terms agreed between the relevant parties.',
          'If a transaction is cancelled before it is finalized or before the agreed commencement date, any applicable refund will be determined according to the agreed terms.',
          'Once a lease or related arrangement has been finalized or commenced, refunds will be subject to the terms agreed between the farmer and landowner.',
          'Krishi Sangam may assist with communication or dispute resolution where appropriate.',
          'Krishi Sangam does not automatically guarantee a refund for disputes between users.'
        ]} />
        <InfoP>Any rent, security deposit, lease amount or other payment between a farmer and landowner is separate from the Priority Listing fee paid to Krishi Sangam.</InfoP>
      </InfoBlock>

      <InfoBlock title="3. Equipment Rental">
        <InfoP>A refund may be considered where:</InfoP>
        <InfoList items={[
          'The equipment owner cancels before the agreed rental period begins.',
          'The equipment is unavailable despite a confirmed arrangement.',
          'The equipment provided is materially different from the agreed listing.',
          'The rental cannot proceed due to circumstances attributable to the equipment owner.'
        ]} />
        <InfoP>Refunds may not apply where:</InfoP>
        <InfoList items={[
          'The rental period has already started.',
          'The equipment has already been used.',
          'The customer cancels after the applicable cancellation period.',
          'The customer accepts the equipment and subsequently changes their preference.',
          'The issue is caused by circumstances outside the reasonable control of the applicable party.'
        ]} />
      </InfoBlock>

      <InfoBlock title="4. Agricultural Services">
        <InfoP>A refund may be considered where:</InfoP>
        <InfoList items={[
          'A confirmed service is cancelled before commencement under the applicable cancellation terms.',
          'The service provider does not provide a confirmed service.',
          'The service is materially different from what was agreed.',
          'The service cannot be delivered due to circumstances attributable to the service provider.'
        ]} />
        <InfoP>Refunds may not apply where:</InfoP>
        <InfoList items={[
          'The service has already been completed.',
          'The customer has accepted the service without raising a timely complaint.',
          'The customer cancels after the applicable cancellation period.',
          'Delay or non-performance is caused by weather, field conditions or other circumstances outside the reasonable control of the service provider.'
        ]} />
      </InfoBlock>

      <InfoBlock title="5. Refund Process">
        <InfoP>Where a refund is approved:</InfoP>
        <InfoList items={[
          'The refund will be processed through the applicable payment method or approved channel.',
          'Processing time may depend on the payment provider and banking system.',
          'Users may be asked to provide transaction details required to process the refund.',
          'Refund eligibility will be determined based on the applicable transaction terms and circumstances.'
        ]} />
      </InfoBlock>
    </InfoPage>
  );
}
