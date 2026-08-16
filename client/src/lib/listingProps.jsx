import { useLanguage } from '../i18n/LanguageContext';
import Icon from '../components/Icon';

const SOIL_MAP = {
  'Black Soil': 'land.black',
  'Red Soil': 'land.red',
  'Alluvial Soil': 'land.alluvial',
  'Loamy Soil': 'land.loamy'
};

const WATER_MAP = {
  'Borewell': 'land.borewell',
  'Canal': 'land.canal',
  'River': 'land.river',
  'Well': 'land.well'
};

const EQUIP_TYPE_MAP = {
  'Tractor': 'equip.tractor',
  'Harvester': 'equip.harvester',
  'Sprayer': 'equip.sprayer',
  'Rotavator': 'equip.rotavator',
  'Seed Drill': 'equip.seedDrill',
  'Other': 'equip.other'
};

const LEASE_MAP = {
  'Per Season': 'land.perSeason',
  'Per Month': 'land.perMonth',
  'Per Year': 'land.perYear'
};

// Normalises a raw listing row from the API into the props the
// ListingDetailsModal expects. Used by ListingCard (cards) and Messages
// (clickable listing links in chat) so both render listings identically.
// NOTE: uses useLanguage() — only call this from inside a component render.
export function listingToModalProps(listing, type) {
  if (!listing) return null;
  const { t } = useLanguage();

  const title = listing.title || listing.name || listing.crop_name || t('card.untitled');
  const location = listing.location || '';
  const district = listing.district || '';

  // Owner identity — labour rows use worker_* columns, everything else owner_*
  const ownerName = listing.owner_name || listing.worker_name || '';
  const ownerPhone = listing.owner_phone || listing.worker_phone || '';
  const ownerId = listing.owner_id || listing.seller_id || listing.worker_id || null;

  // Tags
  let tags = [];
  if (type === 'land') {
    if (listing.area_acres) tags.push({ cls: 'tag-green', text: t('card.acres', { n: listing.area_acres }) });
    if (listing.soil_type) {
      const soilText = SOIL_MAP[listing.soil_type] ? t(SOIL_MAP[listing.soil_type]) : listing.soil_type;
      tags.push({ cls: 'tag-orange', text: soilText });
    }
    if (listing.water_source) {
      const waterText = WATER_MAP[listing.water_source] ? t(WATER_MAP[listing.water_source]) : listing.water_source;
      tags.push({ cls: 'tag-blue', text: <><Icon name="droplet" size={13} style={{ verticalAlign: '-2px', marginRight: '5px' }} />{waterText}</> });
    }
  } else if (type === 'equipment') {
    if (listing.type) {
      const typeText = EQUIP_TYPE_MAP[listing.type] ? t(EQUIP_TYPE_MAP[listing.type]) : listing.type;
      tags.push({ cls: 'tag-orange', text: typeText });
    }
  } else if (type === 'labour') {
    if (listing.skills) tags.push({ cls: 'tag-purple', text: listing.skills });
  } else if (type === 'produce') {
    if (listing.quantity != null && listing.unit) tags.push({ cls: 'tag-amber', text: `${listing.quantity} ${listing.unit}` });
    if (listing.quality_grade) tags.push({ cls: 'tag-slate', text: t('produce.gradeTag', { g: listing.quality_grade }) });
  }

  // Price
  let price = { price: 0, period: '', color: '#16a34a' };
  if (type === 'land') {
    const p = listing.price_per_season || listing.price_per_month || listing.price_per_year || 0;
    const rawLease = listing.lease_type || 'Per Season';
    const translatedLease = LEASE_MAP[rawLease] ? t(LEASE_MAP[rawLease]) : rawLease;
    price = { price: p, period: `/${translatedLease.toLowerCase()}`, color: '#16a34a' };
  } else if (type === 'equipment') {
    price = {
      price: listing.price_per_hour || 0,
      period: t('card.perHour'),
      secondary: `₹ ${(listing.price_per_day || 0).toLocaleString()}${t('card.perDay')}`,
      color: '#ea580c'
    };
  } else if (type === 'labour') {
    price = { price: listing.daily_rate || 0, period: t('card.perDay'), color: '#7c3aed' };
  } else if (type === 'produce') {
    price = { price: listing.price_per_unit || 0, period: `/${listing.unit || 'kg'}`, color: '#d97706' };
  }

  // Visual identity
  const placeholderIcon = type === 'land' ? 'wheat' : type === 'equipment' ? 'tractor' : type === 'labour' ? 'worker' : 'seedling';
  const accent = type === 'land' ? 'linear-gradient(135deg, #16a34a, #4ade80)'
    : type === 'equipment' ? 'linear-gradient(135deg, #ea580c, #fb923c)'
    : type === 'labour' ? 'linear-gradient(135deg, #7c3aed, #a78bfa)'
    : 'linear-gradient(135deg, #d97706, #fbbf24)';

  return {
    title,
    location,
    district,
    image: listing.photo_url || '',
    icon: placeholderIcon,
    accent,
    price,
    tags,
    description: listing.description || '',
    ownerName,
    ownerPhone,
    ownerId,
    deposit: Number(listing.deposit) || 0
  };
}
