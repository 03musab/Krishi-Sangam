/**
 * Mock labour worker listings for development / demo purposes.
 * Each row mirrors the shape returned by the real /api/labour endpoint so
 * ListingCard + listingProps render them identically.
 */

const MOCK_LABOUR = [
  {
    id: 'ml1',
    title: 'Sowing & Planting Specialist',
    worker_name: 'Ramesh Kumar',
    worker_phone: '+91 98765 43210',
    worker_id: 'mock-user-1',
    skills: 'Sowing & Planting',
    team_size: 5,
    team_type: 'Male',
    experience_years: 8,
    daily_rate: 450,
    location: 'Nashik, Maharashtra',
    district: 'Nashik',
    description: 'Experienced team of 5 male workers specialising in sowing and planting. Available for paddy, wheat, and vegetable crops across Nashik district.',
    photo_url: '',
    status: 'approved',
    _mock: true
  },
  {
    id: 'ml2',
    title: 'Experienced Harvesting Crew',
    worker_name: 'Sunita Devi',
    worker_phone: '+91 87654 32109',
    worker_id: 'mock-user-2',
    skills: 'Harvesting',
    team_size: 8,
    team_type: 'Mixed',
    experience_years: 12,
    daily_rate: 400,
    location: 'Pune, Maharashtra',
    district: 'Pune',
    description: 'Skilled harvesting team with 12 years of experience. We handle wheat, rice, and sugarcane harvesting with care and efficiency.',
    photo_url: '',
    status: 'approved',
    _mock: true
  },
  {
    id: 'ml3',
    title: 'Field Preparation Team',
    worker_name: 'Arjun Singh',
    worker_phone: '+91 76543 21098',
    worker_id: 'mock-user-3',
    skills: 'Field Preparation',
    team_size: 3,
    team_type: 'Male',
    experience_years: 6,
    daily_rate: 500,
    location: 'Indore, Madhya Pradesh',
    district: 'Indore',
    description: 'Professional field preparation team. We do ploughing, rotavation, and land leveling using modern techniques. Quick and reliable.',
    photo_url: '',
    status: 'approved',
    _mock: true
  },
  {
    id: 'ml4',
    title: 'Crop Maintenance — All-Women Team',
    worker_name: 'Lakshmi Bai',
    worker_phone: '+91 65432 10987',
    worker_id: 'mock-user-4',
    skills: 'Crop Maintenance',
    team_size: 6,
    team_type: 'Female',
    experience_years: 10,
    daily_rate: 350,
    location: 'Wardha, Maharashtra',
    district: 'Wardha',
    description: 'All-women team specialising in weeding, fertiliser application, and pesticide spraying. Careful and thorough crop maintenance.',
    photo_url: '',
    status: 'approved',
    _mock: true
  },
  {
    id: 'ml5',
    title: 'Irrigation & Drip Line Specialist',
    worker_name: 'Vikram Patel',
    worker_phone: '+91 54321 09876',
    worker_id: 'mock-user-5',
    skills: 'Irrigation',
    team_size: 4,
    team_type: 'Male',
    experience_years: 7,
    daily_rate: 550,
    location: 'Ahmedabad, Gujarat',
    district: 'Ahmedabad',
    description: 'Expert irrigation team. Drip installation, sprinkler setup, and pump repair. We ensure water reaches every corner of your field.',
    photo_url: '',
    status: 'approved',
    _mock: true
  },
  {
    id: 'ml6',
    title: 'Post-Harvest Crew',
    worker_name: 'Priya Sharma',
    worker_phone: '+91 43210 98765',
    worker_id: 'mock-user-6',
    skills: 'Post-Harvest',
    team_size: 10,
    team_type: 'Mixed',
    experience_years: 5,
    daily_rate: 380,
    location: 'Jaipur, Rajasthan',
    district: 'Jaipur',
    description: 'Large post-harvest team for threshing, sorting, grading, and loading. We handle grains, cotton, and pulses with care.',
    photo_url: '',
    status: 'approved',
    _mock: true
  }
];

export default MOCK_LABOUR;
