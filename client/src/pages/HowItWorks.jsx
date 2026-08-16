import InfoPage, { InfoBlock, InfoList } from '../components/InfoPage';
import { useLanguage } from '../i18n/LanguageContext';

const GROUPS = [
  {
    title: 'For Farmers',
    steps: [
      ['Choose What You Need', 'Select: Land, Equipment or Agricultural Services.'],
      ['Submit Your Requirement', 'Provide the required details, location and other relevant information.'],
      ['Discover & Connect', 'Find relevant listings or connect with landowners, equipment owners and service providers.'],
      ['Discuss & Proceed', 'Discuss pricing, availability and terms and proceed with the mutually agreed arrangement.']
    ]
  },
  {
    title: 'For Landowners',
    steps: [
      ['Register', 'Create your Krishi Sangam account.'],
      ['List Your Land', 'Add your land details and availability.'],
      ['Choose Your Listing', 'Use the free Standard Listing or choose the paid Priority Listing for enhanced visibility.'],
      ['Receive Enquiries', 'Connect with farmers interested in your land.']
    ]
  },
  {
    title: 'For Equipment Owners',
    steps: [
      ['Register', 'Create your account.'],
      ['List Your Equipment', 'Add equipment details, location and availability.'],
      ['Receive Enquiries', 'Connect with farmers looking for your equipment.'],
      ['Rent Your Equipment', 'Discuss terms and proceed with the agreed rental arrangement.']
    ]
  },
  {
    title: 'For Service Providers',
    steps: [
      ['Register', 'Create your service-provider profile.'],
      ['List Your Services', 'Tell farmers what services you provide and where you operate.'],
      ['Receive Enquiries', 'Connect with farmers who need your services.'],
      ['Grow Your Customer Network', 'Build your presence and reach more potential customers.']
    ]
  }
];

export default function HowItWorks() {
  const { t } = useLanguage();
  return (
    <InfoPage title={t('howItWorks.title')} subtitle={t('howItWorks.subtitle')}>
      {GROUPS.map((g) => (
        <InfoBlock key={g.title} title={g.title}>
          <InfoList items={g.steps.map(([title, body]) => (
            <span key={title}><strong>{title}.</strong> {body}</span>
          ))} />
        </InfoBlock>
      ))}
    </InfoPage>
  );
}
