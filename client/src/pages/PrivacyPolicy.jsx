import InfoPage, { InfoBlock, InfoP, InfoList } from '../components/InfoPage';
import { useLanguage } from '../i18n/LanguageContext';

export default function PrivacyPolicy() {
  const { t } = useLanguage();
  return (
    <InfoPage title={t('privacy.title')} subtitle={t('privacy.subtitle')}>
      <InfoBlock title="1. Information We Collect">
        <InfoP>Depending on how you use Krishi Sangam, we may collect:</InfoP>
        <InfoList items={[
          'Name',
          'Mobile number',
          'Email address',
          'Address',
          'Location information',
          'Agricultural land location and details',
          'Land ownership/listing information submitted by landowners',
          'Equipment and machinery details',
          'Agricultural service details',
          'User account and registration information',
          'Information submitted through enquiry and contact forms',
          'Booking and transaction information',
          'Payment information where applicable',
          'Information about your interaction with our website/platform',
          'Device and technical information required to operate and improve the platform'
        ]} />
        <InfoP>We only collect information reasonably required to provide, operate and improve our services.</InfoP>
      </InfoBlock>

      <InfoBlock title="2. How We Use Your Information">
        <InfoP>We may use your information to:</InfoP>
        <InfoList items={[
          'Create and manage your Krishi Sangam account',
          'Connect farmers with landowners',
          'Connect farmers with equipment owners',
          'Connect farmers with agricultural service providers',
          'Process enquiries and service requests',
          'Facilitate communication between users',
          'Display listings and information submitted by users',
          'Process Priority Listing purchases and other applicable payments',
          'Provide customer support',
          'Send important service-related notifications and updates',
          'Improve our website and platform',
          'Prevent fraud, misuse or unauthorized activity',
          'Comply with applicable legal requirements'
        ]} />
      </InfoBlock>

      <InfoBlock title="3. Information Sharing">
        <InfoP>Krishi Sangam may share relevant information when necessary to operate the platform and provide the services requested by users. Information may be shared with:</InfoP>
        <InfoList items={[
          'Farmers, landowners, equipment owners or service providers where required to facilitate an enquiry or transaction',
          'Payment service providers for processing applicable payments',
          'Technology and service providers required to operate the platform',
          'Government or legal authorities where required by applicable law'
        ]} />
        <InfoP>Krishi Sangam does not sell users&apos; personal information for unrelated third-party marketing purposes.</InfoP>
      </InfoBlock>

      <InfoBlock title="4. Public Listing Information">
        <InfoP>Information voluntarily submitted as part of a public listing may be visible to other users of Krishi Sangam. This may include information such as:</InfoP>
        <InfoList items={[
          'Land location',
          'Land area',
          'Equipment details',
          'Service details',
          'Listing description',
          'Availability',
          'Listing images'
        ]} />
        <InfoP>Users should avoid submitting unnecessary sensitive or confidential personal information in public listing descriptions.</InfoP>
      </InfoBlock>

      <InfoBlock title="5. Data Security">
        <InfoP>We take reasonable measures to protect user information from unauthorized access, misuse, alteration or disclosure. However, no online platform or electronic transmission can be guaranteed to be completely secure.</InfoP>
      </InfoBlock>

      <InfoBlock title="6. Your Rights">
        <InfoP>Subject to applicable laws and operational requirements, users may request to:</InfoP>
        <InfoList items={[
          'Access personal information associated with their account',
          'Correct inaccurate information',
          'Update account information',
          'Request deletion of their account',
          'Ask questions regarding how their information is used'
        ]} />
        <InfoP>Certain information may need to be retained where required for legal, regulatory, transaction or dispute-related purposes.</InfoP>
      </InfoBlock>

      <InfoBlock title="7. Policy Updates">
        <InfoP>Krishi Sangam may update this Privacy Policy from time to time. Changes will be published on this page.</InfoP>
      </InfoBlock>
    </InfoPage>
  );
}
