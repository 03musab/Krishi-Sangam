export const SERVICE_CATEGORIES = [
  {
    id: 'field-preparation',
    emoji: '🌱',
    name: 'Field Preparation',
    tagline: 'Get your soil ready for planting',
    services: [
      { name: 'Land Ploughing', desc: 'Turning over the topsoil to loosen it before sowing for better root growth.' },
      { name: 'Rotavation', desc: 'Using a rotavator to till and mix soil in a single pass for a fine seedbed.' },
      { name: 'Land Leveling', desc: 'Flattening uneven fields for uniform water distribution and easier farming.' },
      { name: 'Bed Preparation', desc: 'Creating raised beds for vegetable and flower cultivation with good drainage.' },
      { name: 'Ridge Making', desc: 'Forming ridges and furrows for row crops like potato, onion and sugarcane.' }
    ]
  },
  {
    id: 'sowing-planting',
    emoji: '🌾',
    name: 'Sowing & Planting',
    tagline: 'Plant seeds the right way',
    services: [
      { name: 'Sowing', desc: 'Placing seeds at the correct depth and spacing for healthy germination.' },
      { name: 'Seed Drilling', desc: 'Using a seed drill to sow seeds in neat rows at uniform depth.' },
      { name: 'Paddy Transplantation', desc: 'Transplanting rice seedlings from nursery to the main field.' },
      { name: 'Nursery Preparation', desc: 'Raising healthy seedlings in a protected nursery before transplanting.' }
    ]
  },
  {
    id: 'crop-maintenance',
    emoji: '🌿',
    name: 'Crop Maintenance',
    tagline: 'Keep your crop healthy all season',
    services: [
      { name: 'Weeding', desc: 'Removing unwanted weeds that compete with crops for nutrients and water.' },
      { name: 'Fertilizer Application', desc: 'Applying nutrients to the soil to boost crop growth and yield.' },
      { name: 'Pesticide Spraying', desc: 'Protecting crops from insects and pests with safe spraying.' },
      { name: 'Herbicide Spraying', desc: 'Controlling weeds chemically without damaging your main crop.' },
      { name: 'Fungicide Spraying', desc: 'Preventing and treating fungal diseases like blight and mildew.' },
      { name: 'Micronutrient Spraying', desc: 'Foliar spray of zinc, iron and boron to fix nutrient deficiencies.' },
      { name: 'Irrigation Setup', desc: 'Setting up pipes and channels to water your field efficiently.' }
    ]
  },
  {
    id: 'drone-services',
    emoji: '🚁',
    name: 'Drone Services',
    tagline: 'Modern precision farming from the sky',
    services: [
      { name: 'Drone Spraying', desc: 'Aerial application of pesticides and fertilizers over large fields quickly.' },
      { name: 'Drone Fertilizer Spraying', desc: 'Precise aerial fertilizer application that saves time and labour.' },
      { name: 'Drone Seed Broadcasting', desc: 'Scattering seeds from the air for fast coverage of large areas.' },
      { name: 'Crop Health Survey', desc: 'Drone imaging to detect crop stress, disease and pest damage early.' }
    ]
  },
  {
    id: 'harvesting',
    emoji: '🌽',
    name: 'Harvesting',
    tagline: 'Bring in your crop on time',
    services: [
      { name: 'Harvesting', desc: 'Cutting and collecting mature crops at the peak of ripeness.' },
      { name: 'Combine Harvesting', desc: 'Machine harvesting that cuts, threshes and cleans grain in one go.' },
      { name: 'Cotton Picking', desc: 'Careful hand or machine picking of cotton bolls at maturity.' },
      { name: 'Fruit Harvesting', desc: 'Plucking ripe fruits carefully to avoid bruising and damage.' },
      { name: 'Vegetable Harvesting', desc: 'Picking vegetables at the right stage for best quality and shelf life.' }
    ]
  },
  {
    id: 'post-harvest',
    emoji: '🚛',
    name: 'Post-Harvest',
    tagline: 'Process and move your produce',
    services: [
      { name: 'Threshing', desc: 'Separating grain from the chaff or plant stalk after harvesting.' },
      { name: 'Sorting & Grading', desc: 'Classifying produce by size, quality and grade for better market price.' },
      { name: 'Packaging', desc: 'Safe packing of produce for transport and storage.' },
      { name: 'Loading & Unloading', desc: 'Skilled labour to load and unload produce and materials.' },
      { name: 'Transportation', desc: 'Moving your produce from farm to market or storage.' }
    ]
  },
  {
    id: 'orchard-services',
    emoji: '🌳',
    name: 'Orchard Services',
    tagline: 'Care for your fruit trees',
    services: [
      { name: 'Tree Pruning', desc: 'Trimming branches to shape the tree and improve fruit production.' },
      { name: 'Grafting', desc: 'Joining plant parts together to grow better fruit varieties.' },
      { name: 'Coconut Harvesting', desc: 'Safe climbing and harvesting of coconuts from tall palms.' },
      { name: 'Mango Harvesting', desc: 'Careful mango picking that protects the fruit and the tree.' }
    ]
  },
  {
    id: 'irrigation',
    emoji: '💧',
    name: 'Irrigation',
    tagline: 'Water your crops efficiently',
    services: [
      { name: 'Drip Installation', desc: 'Installing drip lines that deliver water directly to plant roots.' },
      { name: 'Drip Repair', desc: 'Fixing leaks and blockages in your drip irrigation system.' },
      { name: 'Sprinkler Installation', desc: 'Setting up sprinklers for even overhead watering of crops.' },
      { name: 'Pump Repair', desc: 'Repair and servicing of water pumps used for irrigation.' }
    ]
  },
  {
    id: 'expert-services',
    emoji: '👨‍🌾',
    name: 'Expert Services',
    tagline: 'Advice from agricultural experts',
    services: [
      { name: 'Agronomist Consultation', desc: 'One-on-one advice from an expert to improve your farming practices.' },
      { name: 'Soil Testing', desc: 'Lab analysis of your soil to know its nutrients and pH balance.' },
      { name: 'Disease Diagnosis', desc: 'Identifying crop diseases and recommending the right treatment.' },
      { name: 'Crop Planning', desc: 'Planning which crops to grow and when for maximum profit.' }
    ]
  }
];

export const TEAM_TYPES = ['Male', 'Female', 'Mixed'];
export const SKILL_LEVELS = ['Unskilled', 'Semi-Skilled', 'Skilled'];

export const DEFAULT_WORKER_RATE = 700;
