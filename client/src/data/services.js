export const SERVICE_CATEGORIES = [
  {
    id: 'field-preparation',
    icon: 'seedling',
    name: 'Field Preparation',
    tagline: 'Get your soil ready for planting',
    desc: 'Ploughing, rotavation and levelling of your land to create a fine, weed-free seedbed for sowing.',
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
    icon: 'wheat',
    name: 'Sowing & Planting',
    tagline: 'Plant seeds the right way',
    desc: 'Placing seeds and seedlings at the correct depth and spacing for healthy germination and strong crop stands.',
    services: [
      { name: 'Sowing', desc: 'Placing seeds at the correct depth and spacing for healthy germination.' },
      { name: 'Seed Drilling', desc: 'Using a seed drill to sow seeds in neat rows at uniform depth.' },
      { name: 'Paddy Transplantation', desc: 'Transplanting rice seedlings from nursery to the main field.' },
      { name: 'Nursery Preparation', desc: 'Raising healthy seedlings in a protected nursery before transplanting.' }
    ]
  },
  {
    id: 'crop-maintenance',
    icon: 'leaf',
    name: 'Crop Maintenance',
    tagline: 'Keep your crop healthy all season',
    desc: 'Weeding, fertilising and protective spraying to keep your crop healthy and productive throughout the season.',
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
    icon: 'drone',
    name: 'Drone Services',
    tagline: 'Modern precision farming from the sky',
    desc: 'Precision aerial spraying, seeding and crop-health surveys using drones for fast, even coverage of large fields.',
    services: [
      { name: 'Drone Spraying', desc: 'Aerial application of pesticides and fertilizers over large fields quickly.' },
      { name: 'Drone Fertilizer Spraying', desc: 'Precise aerial fertilizer application that saves time and labour.' },
      { name: 'Drone Seed Broadcasting', desc: 'Scattering seeds from the air for fast coverage of large areas.' },
      { name: 'Crop Health Survey', desc: 'Drone imaging to detect crop stress, disease and pest damage early.' }
    ]
  },
  {
    id: 'harvesting',
    icon: 'corn',
    name: 'Harvesting',
    tagline: 'Bring in your crop on time',
    desc: 'Cutting, picking and collecting mature crops at peak ripeness to protect yield and quality.',
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
    icon: 'truck',
    name: 'Post-Harvest',
    tagline: 'Process and move your produce',
    desc: 'Threshing, grading, packing and transporting your produce from the field to storage or market.',
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
    icon: 'tree',
    name: 'Orchard Services',
    tagline: 'Care for your fruit trees',
    desc: 'Pruning, grafting and safe harvesting of fruit trees to keep orchards healthy and productive.',
    services: [
      { name: 'Tree Pruning', desc: 'Trimming branches to shape the tree and improve fruit production.' },
      { name: 'Grafting', desc: 'Joining plant parts together to grow better fruit varieties.' },
      { name: 'Coconut Harvesting', desc: 'Safe climbing and harvesting of coconuts from tall palms.' },
      { name: 'Mango Harvesting', desc: 'Careful mango picking that protects the fruit and the tree.' }
    ]
  },
  {
    id: 'irrigation',
    icon: 'droplet',
    name: 'Irrigation',
    tagline: 'Water your crops efficiently',
    desc: 'Installation and repair of drip, sprinkler and pump systems to water crops efficiently and save water.',
    services: [
      { name: 'Drip Installation', desc: 'Installing drip lines that deliver water directly to plant roots.' },
      { name: 'Drip Repair', desc: 'Fixing leaks and blockages in your drip irrigation system.' },
      { name: 'Sprinkler Installation', desc: 'Setting up sprinklers for even overhead watering of crops.' },
      { name: 'Pump Repair', desc: 'Repair and servicing of water pumps used for irrigation.' }
    ]
  },
  {
    id: 'expert-services',
    icon: 'farmer',
    name: 'Expert Services',
    tagline: 'Advice from agricultural experts',
    desc: 'One-on-one guidance from agronomists, soil testing and crop planning to improve your farming decisions.',
    services: [
      { name: 'Agronomist Consultation', desc: 'One-on-one advice from an expert to improve your farming practices.' },
      { name: 'Soil Testing', desc: 'Lab analysis of your soil to know its nutrients and pH balance.' },
      { name: 'Disease Diagnosis', desc: 'Identifying crop diseases and recommending the right treatment.' },
      { name: 'Crop Planning', desc: 'Planning which crops to grow and when for maximum profit.' }
    ]
  }
];

/* Common option lists used by SERVICE_QUESTIONS */
export const CROP_TYPES = [
  'Rice (Paddy)', 'Wheat', 'Maize (Corn)', 'Cotton', 'Sugarcane',
  'Soybean', 'Groundnut', 'Potato', 'Onion', 'Tomato',
  'Chilli', 'Turmeric', 'Banana', 'Mango', 'Grapes',
  'Vegetables (Mixed)', 'Pulses (Mixed)', 'Other'
];

export const SOIL_TYPES = [
  'Black (Regur)', 'Red', 'Sandy', 'Loamy', 'Clay',
  'Silt', 'Chalky', 'Peaty', 'Other'
];

export const GROWTH_STAGES = [
  'Seedling', 'Vegetative', 'Flowering', 'Fruiting', 'Maturity', 'Post-Harvest'
];

export const PEST_TYPES = [
  'Insects', 'Aphids', 'Whitefly', 'Bollworm', 'Stem Borer',
  'Fungal Disease', 'Bacterial Disease', 'Viral Disease',
  'Weeds', 'Rodents', 'Unknown', 'Other'
];

/* Service-specific questions — keyed by service name.
   Each entry defines extra form fields to show below the common fields.
   type: 'select' | 'text' | 'textarea' | 'number'
   options: translated key prefix (resolved via t()) or static array
   required: boolean
*/
export const SERVICE_QUESTIONS = {
  /* ── Field Preparation ── */
  'Land Ploughing': [
    { key: 'crop_type', type: 'select', options: CROP_TYPES, label: 'svc.q.cropToGrow', required: true },
    { key: 'soil_type', type: 'select', options: SOIL_TYPES, label: 'svc.q.soilType', required: true },
    { key: 'field_condition', type: 'select', optionsKey: 'svc.q.fieldCondition.options', label: 'svc.q.fieldCondition', required: false }
  ],
  'Rotavation': [
    { key: 'crop_type', type: 'select', options: CROP_TYPES, label: 'svc.q.cropToGrow', required: true },
    { key: 'soil_type', type: 'select', options: SOIL_TYPES, label: 'svc.q.soilType', required: true },
    { key: 'prev_ploughing', type: 'select', optionsKey: 'svc.q.yesNo', label: 'svc.q.prevPloughing', required: false }
  ],
  'Land Leveling': [
    { key: 'crop_type', type: 'select', options: CROP_TYPES, label: 'svc.q.cropToGrow', required: false },
    { key: 'water_source', type: 'select', optionsKey: 'svc.q.waterSource.options', label: 'svc.q.waterSource', required: false }
  ],
  'Bed Preparation': [
    { key: 'crop_type', type: 'select', options: CROP_TYPES, label: 'svc.q.cropToGrow', required: true },
    { key: 'bed_width', type: 'text', label: 'svc.q.bedWidth', required: false, placeholder: 'e.g. 1 metre' }
  ],
  'Ridge Making': [
    { key: 'crop_type', type: 'select', options: CROP_TYPES, label: 'svc.q.cropToGrow', required: true },
    { key: 'ridge_spacing', type: 'text', label: 'svc.q.ridgeSpacing', required: false, placeholder: 'e.g. 60 cm' }
  ],

  /* ── Sowing & Planting ── */
  'Sowing': [
    { key: 'crop_type', type: 'select', options: CROP_TYPES, label: 'svc.q.cropType', required: true },
    { key: 'seed_variety', type: 'text', label: 'svc.q.seedVariety', required: false, placeholder: 'e.g. HD-2967' },
    { key: 'seed_source', type: 'select', optionsKey: 'svc.q.seedSource.options', label: 'svc.q.seedSource', required: false },
    { key: 'spacing', type: 'text', label: 'svc.q.spacing', required: false, placeholder: 'e.g. 20×10 cm' }
  ],
  'Seed Drilling': [
    { key: 'crop_type', type: 'select', options: CROP_TYPES, label: 'svc.q.cropType', required: true },
    { key: 'seed_variety', type: 'text', label: 'svc.q.seedVariety', required: false },
    { key: 'row_spacing', type: 'text', label: 'svc.q.rowSpacing', required: false, placeholder: 'e.g. 30 cm' }
  ],
  'Paddy Transplantation': [
    { key: 'rice_variety', type: 'text', label: 'svc.q.riceVariety', required: false, placeholder: 'e.g. IR-64' },
    { key: 'seedling_age', type: 'text', label: 'svc.q.seedlingAge', required: false, placeholder: 'e.g. 25 days' },
    { key: 'planting_density', type: 'text', label: 'svc.q.plantingDensity', required: false, placeholder: 'e.g. 2 plants/hill' }
  ],
  'Nursery Preparation': [
    { key: 'crop_type', type: 'select', options: CROP_TYPES, label: 'svc.q.cropType', required: true },
    { key: 'nursery_area', type: 'text', label: 'svc.q.nurseryArea', required: false, placeholder: 'e.g. 10×5 metres' }
  ],

  /* ── Crop Maintenance ── */
  'Weeding': [
    { key: 'crop_type', type: 'select', options: CROP_TYPES, label: 'svc.q.cropType', required: true },
    { key: 'growth_stage', type: 'select', options: GROWTH_STAGES, label: 'svc.q.growthStage', required: true },
    { key: 'weed_type', type: 'text', label: 'svc.q.weedType', required: false, placeholder: 'Describe if known' }
  ],
  'Fertilizer Application': [
    { key: 'crop_type', type: 'select', options: CROP_TYPES, label: 'svc.q.cropType', required: true },
    { key: 'growth_stage', type: 'select', options: GROWTH_STAGES, label: 'svc.q.growthStage', required: true },
    { key: 'fertilizer_type', type: 'text', label: 'svc.q.fertilizerType', required: false, placeholder: 'e.g. Urea, DAP' },
    { key: 'soil_test_done', type: 'select', optionsKey: 'svc.q.yesNo', label: 'svc.q.soilTestDone', required: false }
  ],
  'Pesticide Spraying': [
    { key: 'crop_type', type: 'select', options: CROP_TYPES, label: 'svc.q.cropType', required: true },
    { key: 'pest_type', type: 'select', options: PEST_TYPES, label: 'svc.q.pestType', required: true },
    { key: 'chemical_name', type: 'text', label: 'svc.q.chemicalName', required: false, placeholder: 'If prescribed' },
    { key: 'growth_stage', type: 'select', options: GROWTH_STAGES, label: 'svc.q.growthStage', required: false }
  ],
  'Herbicide Spraying': [
    { key: 'crop_type', type: 'select', options: CROP_TYPES, label: 'svc.q.cropType', required: true },
    { key: 'weed_severity', type: 'select', optionsKey: 'svc.q.severity.options', label: 'svc.q.weedSeverity', required: false },
    { key: 'herbicide_name', type: 'text', label: 'svc.q.herbicideName', required: false, placeholder: 'If prescribed' }
  ],
  'Fungicide Spraying': [
    { key: 'crop_type', type: 'select', options: CROP_TYPES, label: 'svc.q.cropType', required: true },
    { key: 'disease_name', type: 'text', label: 'svc.q.diseaseName', required: false, placeholder: 'e.g. Blight, Mildew' },
    { key: 'affected_area', type: 'select', optionsKey: 'svc.q.areaExtent.options', label: 'svc.q.affectedArea', required: false }
  ],
  'Micronutrient Spraying': [
    { key: 'crop_type', type: 'select', options: CROP_TYPES, label: 'svc.q.cropType', required: true },
    { key: 'deficiency_symptoms', type: 'textarea', label: 'svc.q.deficiencySymptoms', required: false, placeholder: 'Yellowing, stunted growth, etc.' }
  ],
  'Irrigation Setup': [
    { key: 'crop_type', type: 'select', options: CROP_TYPES, label: 'svc.q.cropType', required: false },
    { key: 'water_source', type: 'select', optionsKey: 'svc.q.waterSource.options', label: 'svc.q.waterSource', required: true },
    { key: 'current_irrigation', type: 'select', optionsKey: 'svc.q.currentIrrigation.options', label: 'svc.q.currentIrrigation', required: false }
  ],

  /* ── Drone Services ── */
  'Drone Spraying': [
    { key: 'crop_type', type: 'select', options: CROP_TYPES, label: 'svc.q.cropType', required: true },
    { key: 'pest_type', type: 'select', options: PEST_TYPES, label: 'svc.q.targetPest', required: false },
    { key: 'chemical_name', type: 'text', label: 'svc.q.chemicalName', required: false }
  ],
  'Drone Fertilizer Spraying': [
    { key: 'crop_type', type: 'select', options: CROP_TYPES, label: 'svc.q.cropType', required: true },
    { key: 'fertilizer_type', type: 'text', label: 'svc.q.fertilizerType', required: false },
    { key: 'growth_stage', type: 'select', options: GROWTH_STAGES, label: 'svc.q.growthStage', required: false }
  ],
  'Drone Seed Broadcasting': [
    { key: 'crop_type', type: 'select', options: CROP_TYPES, label: 'svc.q.cropType', required: true },
    { key: 'seed_rate', type: 'text', label: 'svc.q.seedRate', required: false, placeholder: 'e.g. 10 kg/acre' }
  ],
  'Crop Health Survey': [
    { key: 'crop_type', type: 'select', options: CROP_TYPES, label: 'svc.q.cropType', required: true },
    { key: 'suspected_issue', type: 'textarea', label: 'svc.q.suspectedIssue', required: false, placeholder: 'What symptoms are you seeing?' }
  ],

  /* ── Harvesting ── */
  'Harvesting': [
    { key: 'crop_type', type: 'select', options: CROP_TYPES, label: 'svc.q.cropType', required: true },
    { key: 'est_yield', type: 'text', label: 'svc.q.estYield', required: false, placeholder: 'e.g. 20 quintals' },
    { key: 'transport_needed', type: 'select', optionsKey: 'svc.q.yesNo', label: 'svc.q.transportNeeded', required: false }
  ],
  'Combine Harvesting': [
    { key: 'crop_type', type: 'select', options: ['Rice (Paddy)', 'Wheat', 'Maize (Corn)', 'Soybean', 'Other'], label: 'svc.q.cropType', required: true },
    { key: 'est_yield', type: 'text', label: 'svc.q.estYield', required: false },
    { key: 'moisture_level', type: 'select', optionsKey: 'svc.q.moistureLevel.options', label: 'svc.q.moistureLevel', required: false }
  ],
  'Cotton Picking': [
    { key: 'est_yield', type: 'text', label: 'svc.q.estYield', required: false, placeholder: 'e.g. 10 quintals' },
    { key: 'transport_needed', type: 'select', optionsKey: 'svc.q.yesNo', label: 'svc.q.transportNeeded', required: false }
  ],
  'Fruit Harvesting': [
    { key: 'crop_type', type: 'select', options: ['Mango', 'Banana', 'Grapes', 'Other'], label: 'svc.q.fruitType', required: true },
    { key: 'est_yield', type: 'text', label: 'svc.q.estYield', required: false },
    { key: 'handling_notes', type: 'textarea', label: 'svc.q.handlingNotes', required: false, placeholder: 'Special handling requirements...' }
  ],
  'Vegetable Harvesting': [
    { key: 'crop_type', type: 'select', options: ['Tomato', 'Onion', 'Potato', 'Chilli', 'Vegetables (Mixed)', 'Other'], label: 'svc.q.vegType', required: true },
    { key: 'est_yield', type: 'text', label: 'svc.q.estYield', required: false },
    { key: 'grade_required', type: 'select', optionsKey: 'svc.q.gradeRequired.options', label: 'svc.q.gradeRequired', required: false }
  ],

  /* ── Post-Harvest ── */
  'Threshing': [
    { key: 'crop_type', type: 'select', options: ['Rice (Paddy)', 'Wheat', 'Maize (Corn)', 'Other'], label: 'svc.q.cropType', required: true },
    { key: 'est_yield', type: 'text', label: 'svc.q.estYield', required: false }
  ],
  'Sorting & Grading': [
    { key: 'produce_type', type: 'select', options: CROP_TYPES, label: 'svc.q.produceType', required: true },
    { key: 'grade_required', type: 'select', optionsKey: 'svc.q.gradeRequired.options', label: 'svc.q.gradeRequired', required: false }
  ],
  'Packaging': [
    { key: 'produce_type', type: 'select', options: CROP_TYPES, label: 'svc.q.produceType', required: true },
    { key: 'packaging_type', type: 'select', optionsKey: 'svc.q.packagingType.options', label: 'svc.q.packagingType', required: false }
  ],
  'Loading & Unloading': [
    { key: 'material_type', type: 'text', label: 'svc.q.materialType', required: false, placeholder: 'e.g. sacks, crates, bags' },
    { key: 'est_weight', type: 'text', label: 'svc.q.estWeight', required: false, placeholder: 'e.g. 5 tonnes' }
  ],
  'Transportation': [
    { key: 'produce_type', type: 'select', options: CROP_TYPES, label: 'svc.q.produceType', required: true },
    { key: 'destination', type: 'text', label: 'svc.q.destination', required: true, placeholder: 'e.g. Mandi, Cold storage' },
    { key: 'est_distance', type: 'text', label: 'svc.q.estDistance', required: false, placeholder: 'e.g. 30 km' }
  ],

  /* ── Orchard Services ── */
  'Tree Pruning': [
    { key: 'fruit_type', type: 'select', options: ['Mango', 'Coconut', 'Banana', 'Grapes', 'Other'], label: 'svc.q.fruitType', required: true },
    { key: 'num_trees', type: 'number', label: 'svc.q.numTrees', required: false },
    { key: 'tree_age', type: 'text', label: 'svc.q.treeAge', required: false, placeholder: 'e.g. 10 years' }
  ],
  'Grafting': [
    { key: 'fruit_type', type: 'select', options: ['Mango', 'Citrus', 'Other'], label: 'svc.q.fruitType', required: true },
    { key: 'num_trees', type: 'number', label: 'svc.q.numTrees', required: false },
    { key: 'desired_variety', type: 'text', label: 'svc.q.desiredVariety', required: false, placeholder: 'e.g. Alphonso' }
  ],
  'Coconut Harvesting': [
    { key: 'num_trees', type: 'number', label: 'svc.q.numTrees', required: true },
    { key: 'tree_height', type: 'text', label: 'svc.q.treeHeight', required: false, placeholder: 'e.g. 15 metres' }
  ],
  'Mango Harvesting': [
    { key: 'variety', type: 'text', label: 'svc.q.mangoVariety', required: false, placeholder: 'e.g. Alphonso, Dashehari' },
    { key: 'num_trees', type: 'number', label: 'svc.q.numTrees', required: false },
    { key: 'est_yield', type: 'text', label: 'svc.q.estYield', required: false }
  ],

  /* ── Irrigation ── */
  'Drip Installation': [
    { key: 'crop_type', type: 'select', options: CROP_TYPES, label: 'svc.q.cropType', required: true },
    { key: 'water_source', type: 'select', optionsKey: 'svc.q.waterSource.options', label: 'svc.q.waterSource', required: true },
    { key: 'water_pressure', type: 'text', label: 'svc.q.waterPressure', required: false, placeholder: 'e.g. 2 kg/cm²' }
  ],
  'Drip Repair': [
    { key: 'issue_type', type: 'textarea', label: 'svc.q.issueType', required: true, placeholder: 'Describe the problem...' },
    { key: 'system_age', type: 'text', label: 'svc.q.systemAge', required: false, placeholder: 'e.g. 3 years' }
  ],
  'Sprinkler Installation': [
    { key: 'crop_type', type: 'select', options: CROP_TYPES, label: 'svc.q.cropType', required: true },
    { key: 'water_source', type: 'select', optionsKey: 'svc.q.waterSource.options', label: 'svc.q.waterSource', required: true }
  ],
  'Pump Repair': [
    { key: 'pump_type', type: 'select', optionsKey: 'svc.q.pumpType.options', label: 'svc.q.pumpType', required: true },
    { key: 'issue_type', type: 'textarea', label: 'svc.q.issueType', required: true, placeholder: 'Describe the problem...' }
  ],

  /* ── Expert Services ── */
  'Agronomist Consultation': [
    { key: 'crop_type', type: 'select', options: CROP_TYPES, label: 'svc.q.cropType', required: true },
    { key: 'farm_size', type: 'text', label: 'svc.q.farmSizeAcres', required: false, placeholder: 'e.g. 5 acres' },
    { key: 'main_concern', type: 'textarea', label: 'svc.q.mainConcern', required: true, placeholder: 'What farming challenge are you facing?' }
  ],
  'Soil Testing': [
    { key: 'soil_type', type: 'select', options: SOIL_TYPES, label: 'svc.q.soilType', required: false },
    { key: 'previous_crop', type: 'select', options: CROP_TYPES, label: 'svc.q.previousCrop', required: false },
    { key: 'test_purpose', type: 'select', optionsKey: 'svc.q.testPurpose.options', label: 'svc.q.testPurpose', required: false }
  ],
  'Disease Diagnosis': [
    { key: 'crop_type', type: 'select', options: CROP_TYPES, label: 'svc.q.cropType', required: true },
    { key: 'symptoms', type: 'textarea', label: 'svc.q.symptoms', required: true, placeholder: 'Describe what you see on the plants...' },
    { key: 'affected_area', type: 'select', optionsKey: 'svc.q.areaExtent.options', label: 'svc.q.affectedArea', required: false }
  ],
  'Crop Planning': [
    { key: 'farm_size', type: 'text', label: 'svc.q.farmSizeAcres', required: true, placeholder: 'e.g. 5 acres' },
    { key: 'soil_type', type: 'select', options: SOIL_TYPES, label: 'svc.q.soilType', required: false },
    { key: 'irrigation_available', type: 'select', optionsKey: 'svc.q.yesNo', label: 'svc.q.irrigationAvailable', required: false },
    { key: 'budget_range', type: 'text', label: 'svc.q.budgetRange', required: false, placeholder: 'e.g. ₹50,000 per season' }
  ]
};

export const TEAM_TYPES = ['Male', 'Female', 'Mixed'];
export const SKILL_LEVELS = ['Unskilled', 'Semi-Skilled', 'Skilled'];

export const DEFAULT_WORKER_RATE = 350;

/* Default daily rate for equipment rented WITH an operator (₹ per day). */
export const DEFAULT_EQUIPMENT_RATE = 1500;

/* Catalogue of rentable equipment, grouped by category (shown on the
   Equipment Rental page for browsing). */
export const EQUIPMENT_CATEGORIES = [
  {
    icon: 'shower',
    label: 'Irrigation',
    items: [
      'Portable Sprinkler Kit',
      'Rain Gun Sprinkler',
      'Water Pump (Diesel/Electric)',
      'Submersible Pump',
      'Lay Flat Pipe',
      'HDPE Delivery Pipe',
      'Hose Reel',
      'Water Tank (Portable)'
    ]
  },
  {
    icon: 'leaf',
    label: 'Crop Protection',
    items: [
      'Battery Sprayer',
      'Knapsack Sprayer',
      'Power Sprayer',
      'Mist Blower',
      'Fogging Machine'
    ]
  },
  {
    icon: 'tree',
    label: 'Orchard & Garden',
    items: [
      'Brush Cutter',
      'Hedge Trimmer',
      'Chainsaw',
      'Pole Pruner',
      'Fruit Picker'
    ]
  },
  {
    icon: 'wheat',
    label: 'Harvest & Post-Harvest',
    items: [
      'Grain Moisture Meter',
      'Grain Cleaner (portable)'
    ]
  },
  {
    icon: 'zap',
    label: 'Utilities',
    items: [
      'Portable Generator',
      'Portable LED Work Lights',
      'Extension Cable Reel'
    ]
  },
  {
    icon: 'wrench',
    label: 'Farm Maintenance',
    items: [
      'Pressure Washer',
      'Water Transfer Pump',
      'Portable Welding Machine',
      'Portable Air Compressor'
    ]
  }
];
