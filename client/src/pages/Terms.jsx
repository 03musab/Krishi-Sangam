import InfoPage, { InfoBlock, InfoP, InfoList } from '../components/InfoPage';
import { useLanguage } from '../i18n/LanguageContext';

export default function Terms() {
  const { t } = useLanguage();
  return (
    <InfoPage title={t('terms.title')} subtitle={t('terms.subtitle')}>
      <InfoBlock title="1. Platform Role">
        <InfoP>Krishi Sangam is a digital platform designed to facilitate connections between:</InfoP>
        <InfoList items={[
          'Farmers',
          'Landowners',
          'Equipment owners',
          'Agricultural service providers'
        ]} />
        <InfoP>Krishi Sangam may facilitate discovery, enquiries and communication between users. Unless specifically stated otherwise, Krishi Sangam is not itself the owner of the agricultural land or equipment listed by users and is not itself the provider of every agricultural service listed on the platform.</InfoP>
      </InfoBlock>

      <InfoBlock title="2. User Responsibilities">
        <InfoP>Users must:</InfoP>
        <InfoList items={[
          'Provide accurate information',
          'Keep their listings updated',
          'Use the platform lawfully',
          'Provide genuine information',
          'Respect other users',
          'Avoid fraudulent or misleading listings',
          'Comply with applicable laws'
        ]} />
      </InfoBlock>

      <InfoBlock title="3. Landowner Responsibilities">
        <InfoP>Landowners are responsible for:</InfoP>
        <InfoList items={[
          'Providing accurate land information',
          'Having appropriate rights or authority to list the land',
          'Providing accurate availability information',
          'Disclosing relevant information about the land',
          'Discussing lease terms honestly with interested farmers'
        ]} />
      </InfoBlock>

      <InfoBlock title="4. Equipment Owner Responsibilities">
        <InfoP>Equipment owners are responsible for:</InfoP>
        <InfoList items={[
          'Providing accurate equipment information',
          'Maintaining equipment in appropriate working condition',
          'Providing accurate availability',
          'Disclosing relevant equipment requirements or limitations',
          'Agreeing rental terms directly with the customer'
        ]} />
      </InfoBlock>

      <InfoBlock title="5. Service Provider Responsibilities">
        <InfoP>Service providers are responsible for:</InfoP>
        <InfoList items={[
          'Providing accurate service information',
          'Maintaining reasonable service standards',
          'Honouring confirmed arrangements',
          'Providing accurate pricing information where applicable',
          'Following applicable safety and legal requirements'
        ]} />
      </InfoBlock>

      <InfoBlock title="6. Listing Options">
        <InfoP>Krishi Sangam may provide different listing options.</InfoP>
        <InfoP><strong>Standard Listing:</strong> Available free of cost where applicable.</InfoP>
        <InfoP><strong>Priority Listing:</strong> An optional paid feature providing enhanced visibility to eligible listings.</InfoP>
        <InfoP>Priority Listing does not guarantee:</InfoP>
        <InfoList items={[
          'A transaction',
          'A lease',
          'A rental',
          'A service booking',
          'A specific number of enquiries',
          'A specific financial return'
        ]} />
      </InfoBlock>

      <InfoBlock title="7. Listing Accuracy">
        <InfoP>Krishi Sangam reserves the right to review, modify, restrict or remove listings that:</InfoP>
        <InfoList items={[
          'Contain misleading information',
          'Violate applicable laws',
          'Are fraudulent',
          'Contain prohibited content',
          'Violate Krishi Sangam policies',
          'Create a risk to users or the platform'
        ]} />
      </InfoBlock>

      <InfoBlock title="8. Payments">
        <InfoP>Where payments are processed through Krishi Sangam, users must provide accurate payment information. Payment terms, applicable fees, refunds and cancellations will be governed by the relevant transaction and platform policies.</InfoP>
      </InfoBlock>

      <InfoBlock title="9. Disputes">
        <InfoP>Users should first attempt to resolve transaction-related disputes directly with the relevant party. Krishi Sangam may assist with communication or dispute resolution where appropriate but does not guarantee resolution of every dispute.</InfoP>
      </InfoBlock>

      <InfoBlock title="10. Prohibited Activities">
        <InfoP>Users must not:</InfoP>
        <InfoList items={[
          'Create fraudulent listings',
          'Provide false information',
          'Misuse another person&apos;s identity',
          'Attempt unauthorized access',
          'Use the platform for illegal activities',
          'Harass or threaten other users',
          'Upload harmful or malicious content'
        ]} />
      </InfoBlock>

      <InfoBlock title="11. Account Suspension">
        <InfoP>Krishi Sangam may suspend, restrict or terminate accounts where there is evidence of:</InfoP>
        <InfoList items={[
          'Fraud',
          'Misuse',
          'Repeated violations',
          'False information',
          'Abuse of the platform',
          'Illegal activity',
          'Other conduct that may harm users or the platform'
        ]} />
      </InfoBlock>

      <InfoBlock title="12. Limitation of Liability">
        <InfoP>Krishi Sangam provides a platform for discovery and connection between users. Users are responsible for independently evaluating listings, users, land, equipment, services, pricing, documentation and agreements before proceeding with a transaction.</InfoP>
      </InfoBlock>

      <InfoBlock title="13. Changes to Terms">
        <InfoP>Krishi Sangam may update these Terms &amp; Conditions from time to time. Continued use of the platform after updates may constitute acceptance of the revised terms.</InfoP>
      </InfoBlock>
    </InfoPage>
  );
}
