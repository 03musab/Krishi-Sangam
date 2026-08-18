const PDFDocument = require('pdfkit');
const fs = require('fs');

const doc = new PDFDocument({ size: 'A4', margin: 50 });
const stream = fs.createWriteStream('KrishiSangam_Comparison_Report.pdf');
doc.pipe(stream);

// Colors
const GREEN = '#15803d';
const DARK = '#0f172a';
const GRAY = '#64748b';
const RED = '#dc2626';
const ORANGE = '#ea580c';
const BLUE = '#2563eb';

// ── Helper functions ──
function title(text) {
  doc.fontSize(22).fillColor(DARK).font('Helvetica-Bold').text(text, { align: 'center' });
  doc.moveDown(0.3);
}

function subtitle(text) {
  doc.fontSize(11).fillColor(GRAY).font('Helvetica').text(text, { align: 'center' });
  doc.moveDown(0.8);
}

function sectionHeading(num, text) {
  checkPageBreak(60);
  doc.moveDown(0.5);
  doc.fontSize(14).fillColor(GREEN).font('Helvetica-Bold').text(`${num}. ${text}`);
  doc.moveDown(0.3);
}

function subHeading(text) {
  doc.fontSize(10).fillColor(DARK).font('Helvetica-Bold').text(text);
  doc.moveDown(0.1);
}

function body(text) {
  doc.fontSize(9.5).fillColor(DARK).font('Helvetica').text(text, { lineGap: 2 });
  doc.moveDown(0.2);
}

function bullet(text, indent = 50) {
  doc.fontSize(9.5).fillColor(DARK).font('Helvetica').text(`• ${text}`, indent, doc.y, { width: 500 - indent + 50, lineGap: 1 });
}

function statusLine(label, status, detail) {
  const color = status === 'DONE' ? GREEN : status === 'PARTIAL' ? ORANGE : RED;
  doc.fontSize(9.5).font('Helvetica-Bold').fillColor(DARK).text(`  ${label}: `, { continued: true })
    .fillColor(color).text(status, { continued: true })
    .fillColor(GRAY).font('Helvetica').text(` — ${detail}`);
  doc.moveDown(0.1);
}

function checkPageBreak(needed) {
  if (doc.y + needed > 750) doc.addPage();
}

function divider() {
  doc.moveDown(0.3);
  doc.strokeColor('#e2e8f0').lineWidth(0.5).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
  doc.moveDown(0.3);
}

// ══════════════════════════════════════════════════════════
//  PAGE 1: COVER
// ══════════════════════════════════════════════════════════
doc.moveDown(6);
title('Krishi Sangam');
subtitle('Feature Comparison Report');
doc.moveDown(1);
doc.fontSize(10).fillColor(GRAY).font('Helvetica').text(
  'Current Website Implementation vs.\nProposed Backend Architecture Specification',
  { align: 'center', lineGap: 4 }
);
doc.moveDown(2);
doc.fontSize(9).fillColor(GRAY).text('Generated: August 18, 2026', { align: 'center' });
doc.moveDown(0.3);
doc.text('Codebase: Krishi-Sangam (React + Node.js + Supabase)', { align: 'center' });

doc.addPage();

// ══════════════════════════════════════════════════════════
//  EXECUTIVE SUMMARY
// ══════════════════════════════════════════════════════════
title('Executive Summary');
doc.moveDown(0.3);

body('This report compares the current Krishi Sangam website implementation against the proposed backend architecture specification. The specification describes a Swiggy/Zomato-style marketplace where farmers submit requirements and the platform matches them with registered service providers within 25 km.');
doc.moveDown(0.3);
body('The current website has strong frontend features (registration, listing browsing, booking forms, payments, chatbot, i18n in 12 languages) but the backend matching engine, provider-side workflows, and smart booking flow described in the specification are not yet implemented.');
doc.moveDown(0.5);

// Summary table
subHeading('Overall Status by Section');
doc.moveDown(0.2);

const summaryItems = [
  ['Platform concept (marketplace model)', 'DONE', 'Frontend presents as marketplace; backend connects farmers with providers'],
  ['Equipment Rental flow', 'PARTIAL', 'Booking form exists but no auto-matching, no HP/attachment filtering'],
  ['Labour booking flow', 'PARTIAL', 'Labour team form collects workers/days/location but no provider matching'],
  ['Agricultural Services flow', 'PARTIAL', '9 service categories with forms exist but no provider-side matching'],
  ['Saved Farm Information', 'PARTIAL', 'Registration collects farm details but no "My Farm vs Other Farm" booking flow'],
  ['25 km provider matching', 'NOT DONE', 'No geolocation-based matching engine exists'],
  ['Provider availability calendar', 'NOT DONE', 'No calendar/availability system for providers'],
  ['Smart booking flow (My Farm/Other Farm)', 'NOT DONE', 'Booking forms don\'t ask "Who is this booking for?"'],
  ['Service-specific question forms', 'PARTIAL', 'Different forms for equipment/labour/services but questions are generic'],
  ['Provider registration details', 'PARTIAL', 'Basic registration exists but lacks equipment/service-specific fields'],
  ['Provider capability matching', 'NOT DONE', 'No logic to match provider capabilities to farmer requirements'],
  ['OTP/arrival confirmation', 'NOT DONE', 'No arrival confirmation or work-completion OTP flow'],
  ['Rating & Review system', 'PARTIAL', 'Reviews table exists in DB but no UI to submit/view reviews'],
  ['Payment escrow system', 'PARTIAL', 'Escrow table and admin release exist but no user-facing payment flow'],
  ['Common booking engine', 'NOT DONE', 'Three separate booking forms instead of one unified engine'],
];

summaryItems.forEach(([label, status, detail]) => {
  checkPageBreak(35);
  statusLine(label, status, detail);
});

doc.addPage();

// ══════════════════════════════════════════════════════════
//  SECTION-BY-SECTION COMPARISON
// ══════════════════════════════════════════════════════════
title('Section-by-Section Comparison');

// ── 1. Platform Concept ──
sectionHeading(1, 'Platform Concept — "Swiggy for Agriculture"');
subHeading('Specification says:');
bullet('Krishi Sangam looks like it provides services but actually connects farmers with registered service providers');
bullet('Three service types: Equipment Rental, Labour, Agricultural Services');
bullet('The platform is a marketplace and booking platform, not the actual service executor');
subHeading('Current implementation:');
bullet('Frontend presents all three service types with dedicated pages and booking forms');
bullet('Backend stores listings and bookings but does NOT auto-match farmers to providers');
bullet('Bookings are created directly against a specific listing/owner (no smart matching)');
statusLine('Status', 'PARTIAL', 'Concept is correct but matching engine is missing');

// ── 2. Equipment Rental ──
sectionHeading(2, 'Equipment Rental — "Tractor + Operator Always"');
subHeading('Specification says:');
bullet('Tractor is always provided WITH an operator/driver');
bullet('Farmer specifies: equipment type, HP, attachment (rotavator), farm size, date, time, location');
bullet('Backend finds registered tractor providers near the farm');
bullet('System sends request to suitable providers, one accepts, booking confirmed');
subHeading('Current implementation:');
bullet('BookEquipmentWithOperator form collects: equipment type, days, date/time, location');
bullet('Equipment listings show with/without operator as a tag');
bullet('Booking goes directly to a specific listing owner — no auto-matching');
bullet('Missing: HP filter, attachment matching, "What work do you need?" question');
statusLine('Status', 'PARTIAL', 'Form exists but no smart matching or HP/attachment logic');

// ── 3. Labour ──
sectionHeading(3, 'Labour Booking — "Number of Workers Required"');
subHeading('Specification says:');
bullet('Farmer tells how many people are needed');
bullet('Backend finds labour providers who can supply that many people in the area');
bullet('Key field: Number of labourers required');
subHeading('Current implementation:');
bullet('BookLabourTeam form collects: workers, days, field size, date/time, location');
bullet('Mock labour listings show individual workers/teams');
bullet('Booking goes to a specific listing — no matching by capacity');
statusLine('Status', 'PARTIAL', 'Form collects right fields but no capacity-based matching');

// ── 4. Agricultural Services ──
sectionHeading(4, 'Agricultural Services — Category-Based Booking');
subHeading('Specification says:');
bullet('Farmer selects service type (e.g., "Land Preparation")');
bullet('System asks service-specific questions (farm size, crop, soil, date, location)');
bullet('Backend finds appropriate registered service provider');
subHeading('Current implementation:');
bullet('9 service categories implemented: Field Prep, Sowing, Crop Maintenance, Drones, Harvesting, Post-Harvest, Orchard, Irrigation, Expert');
bullet('Each category has sub-services with descriptions');
bullet('ServiceBookingForm collects: date/time, workers, field size, location, notes');
bullet('No crop/soil-type questions in the service form');
statusLine('Status', 'PARTIAL', 'Categories and forms exist but questions are not service-specific enough');

// ── 5. Saved Farm Information ──
sectionHeading(5, 'Saved Farm Information');
subHeading('Specification says:');
bullet('Save farmer profile: name, mobile, email, village, district, farm location, size, soil, irrigation, crop, access');
bullet('Before every booking, ask: "Who is this booking for?" → My Farm / Someone Else\'s Farm');
bullet('If "My Farm": show saved details, let user confirm or edit');
bullet('If "Someone Else\'s Farm": collect full farm details');
subHeading('Current implementation:');
bullet('New farmer registration collects: land size, unit, ownership, irrigation type, crops, soil type, experience, farm access, notes');
bullet('Booking forms do NOT ask "Who is this booking for?"');
bullet('Booking forms always require manual entry of farm details');
statusLine('Status', 'PARTIAL', 'Registration collects farm info but booking flow doesn\'t use it');

// ── 6. My Farm vs Other Farm ──
sectionHeading(6, 'Smart Booking — "My Farm" vs "Someone Else\'s Farm"');
subHeading('Specification says:');
bullet('Ask before every booking');
bullet('If "My Farm" → pre-fill saved details, show confirm/edit');
bullet('If "Other Farm" → collect all details');
subHeading('Current implementation:');
bullet('This flow is NOT implemented');
bullet('No UI prompt for "Who is this booking for?"');
bullet('No pre-fill from saved profile');
statusLine('Status', 'NOT DONE', 'Entire smart booking flow is missing');

doc.addPage();

// ── 7. Service-Specific Questions ──
sectionHeading(7, 'Service-Specific Questions');
subHeading('Specification says:');
bullet('Don\'t ask every farmer every question — questions change per service');
bullet('Tractor: farm size, date, time, location, crop, soil, equipment, HP, hours/acres, attachments');
bullet('Labour: type of work, number of labourers, days, date, start time, farm size, location, crop');
bullet('Services: varies by type (ploughing → soil type; spraying → spray type; harvesting → crop type)');
subHeading('Current implementation:');
bullet('Three separate booking forms (equipment, labour, service) with different fields');
bullet('Equipment form: equipment type, days, date/time, location, notes');
bullet('Labour form: workers, days, field size, date/time, location, notes');
bullet('Service form: date/time, workers, field size, location, notes');
bullet('Missing: crop type, soil type, spray type, HP requirements, attachment needs');
statusLine('Status', 'PARTIAL', 'Different forms exist but questions are generic, not service-specific');

// ── 8. 25 km Matching System ──
sectionHeading(8, '25 km Provider Matching System');
subHeading('Specification says:');
bullet('Search for providers within 25 km of the farm');
bullet('Don\'t send to everyone — only to providers who CAN fulfill the requirement');
bullet('Check: distance, equipment capability, availability, operator included');
bullet('Example: Provider A (5km, has rotavator, available) → Send; Provider B (8km, no rotavator) → Skip');
subHeading('Current implementation:');
bullet('No geolocation-based matching exists');
bullet('Listings show distance from user (via LocationContext) but this is display-only');
bullet('Booking is manual — farmer picks a specific listing, not auto-matched');
bullet('No logic to check provider capability against farmer requirements');
statusLine('Status', 'NOT DONE', 'No matching engine exists');

// ── 9. Provider Registration ──
sectionHeading(9, 'Provider Registration Details');
subHeading('Specification says:');
bullet('Basic: name, mobile, business name, address, village, district, GPS, KYC, bank/UPI');
bullet('Equipment providers: type, brand, model, year, HP, registration, attachments, operator, pricing, max distance');
bullet('Labour providers: number of workers, work types, crop experience, max workers');
bullet('Service providers: service types they offer');
subHeading('Current implementation:');
bullet('Registration collects: name, phone, email, gender, DOB, government ID, location, bank/UPI');
bullet('Equipment listing form: name, type, price/hr, price/day, deposit, operator');
bullet('Labour listing form: title, skills, experience, daily rate, location');
bullet('Missing: brand, model, year, HP, registration number, attachments list, max service distance');
statusLine('Status', 'PARTIAL', 'Basic registration works but lacks equipment/service-specific detail fields');

// ── 10. Provider Availability Calendar ──
sectionHeading(10, 'Provider Availability Calendar');
subHeading('Specification says:');
bullet('Every provider should have an availability calendar');
bullet('If farmer requests a date that\'s booked → don\'t send request to that provider');
subHeading('Current implementation:');
bullet('Labour services have an "availability" field (available/busy/offline) — text only, no calendar');
bullet('No date-based availability tracking for any provider type');
bullet('No calendar UI for providers to mark available/unavailable dates');
statusLine('Status', 'NOT DONE', 'No availability calendar system exists');

// ── 11. Booking Flow ──
sectionHeading(11, 'Complete Booking Flow');
subHeading('Specification says (ideal flow):');
bullet('Farmer → Selects service → "Who is this for?" → My Farm / Other Farm → Booking details → Pin location → Date/Time → Request created → Backend matches → Provider accepts → Booking confirmed → Payment → Provider arrives → OTP confirmation → Work begins → Work completed → Farmer confirms → Provider paid → Rating');
subHeading('Current implementation:');
bullet('Farmer → Selects listing → Clicks "Book" → Fills form → Booking created (status: pending)');
bullet('Owner can confirm/cancel from "Incoming" tab');
bullet('Payment escrow exists at DB level but no user-facing payment flow');
bullet('No OTP/arrival confirmation');
bullet('No work-completion confirmation flow');
bullet('No rating/review submission UI');
statusLine('Status', 'PARTIAL', 'Basic booking exists but many steps in the ideal flow are missing');

// ── 12. One Common Booking Engine ──
sectionHeading(12, 'One Common Booking Engine');
subHeading('Specification says:');
bullet('Don\'t build three completely separate systems');
bullet('Build ONE common booking/matching engine');
bullet('Only the information required changes per service type');
bullet('All three go through: Provider Matching → 25 km Radius → Availability → Capability → Accept → Booking → Payment → Completion → Rating');
subHeading('Current implementation:');
bullet('Three separate booking components: BookEquipmentWithOperator, BookLabourTeam, ServiceBookingForm');
bullet('Three separate submission handlers calling the same bookService() API');
bullet('No unified matching/filtering engine behind them');
statusLine('Status', 'NOT DONE', 'Three separate systems exist; no unified engine');

doc.addPage();

// ── 13. What We Collect from Providers ──
sectionHeading(13, 'Provider Equipment & Service Catalogue');
subHeading('Specification says:');
bullet('Equipment: type, brand, model, year, HP, registration, attachments, operator, pricing, min booking, max distance, availability');
bullet('Labour: number of workers, work types, crop experience, max workers');
bullet('Services: land prep, sowing, spraying, harvesting, weeding, planting, irrigation, other');
subHeading('Current implementation:');
bullet('Equipment listings: name, type (tractor/harvester/sprayer/etc.), price/hr, price/day, deposit, with_operator');
bullet('Labour listings: title, skills, experience, daily rate, location');
bullet('Service categories: 9 categories with sub-services defined in data/services.js');
bullet('Missing from equipment: brand, model, year, HP, registration, attachments, max distance');
statusLine('Status', 'PARTIAL', 'Basic listing structure exists but lacks detailed equipment specs');

// ── 14. Payment & Completion ──
sectionHeading(14, 'Payment, Completion & Rating');
subHeading('Specification says:');
bullet('Payment held in escrow');
bullet('Provider goes to farm → OTP/arrival confirmation → Work begins → Work completed → Farmer confirms → Provider receives payout → Rating & Review');
subHeading('Current implementation:');
bullet('Payments table with escrow status (held/released/refunded)');
bullet('Admin can release escrow payments');
bullet('Reviews table exists in DB (reviewer, reviewee, booking, rating, comment)');
bullet('No user-facing payment submission UI');
bullet('No OTP arrival confirmation');
bullet('No work-completion confirmation');
bullet('No review submission or display UI');
statusLine('Status', 'PARTIAL', 'DB schema exists for payments and reviews but no frontend flows');

// ── 15. Summary Sentence ──
sectionHeading(15, 'The One-Sentence Summary');
subHeading('Specification says:');
doc.fontSize(9.5).fillColor(BLUE).font('Helvetica-Oblique').text(
  '"Krishi Sangam should look to the farmer like one company providing agricultural equipment, labour and services, but behind the scenes it should work like Swiggy. We collect the farmer\'s requirement, find suitable registered providers within 25 km who are available and capable, send them the request, and once one provider accepts, we connect that provider with the farmer and manage the booking, payment, completion and rating."',
  { indent: 20, width: 480, lineGap: 3 }
);
doc.moveDown(0.3);
doc.fillColor(DARK).font('Helvetica');
subHeading('Current implementation:');
doc.fontSize(9.5).text(
  'The current website has a solid frontend with 3 service types, 12-language i18n, booking forms, payment escrow schema, and admin tools. However, the "Swiggy-like" matching engine — the core concept of auto-matching farmer requirements to nearby capable providers — is not yet built. The three booking systems operate independently rather than through a unified engine.',
  { indent: 20, width: 480, lineGap: 3 }
);

doc.addPage();

// ══════════════════════════════════════════════════════════
//  PRIORITY ROADMAP
// ══════════════════════════════════════════════════════════
title('Recommended Implementation Roadmap');
doc.moveDown(0.3);

subHeading('Phase 1 — Smart Booking Flow (Weeks 1–2)');
bullet('Add "Who is this booking for?" prompt (My Farm / Other Farm)');
bullet('Pre-fill saved farm details when "My Farm" is selected');
bullet('Collect full farm details when "Other Farm" is selected');
bullet('Add service-specific questions (crop, soil, HP, attachments)');

subHeading('Phase 2 — Provider Matching Engine (Weeks 3–4)');
bullet('Build unified booking/matching engine (one system, three service types)');
bullet('Implement 25 km geolocation matching using PostGIS or Haversine formula');
bullet('Match provider capabilities to farmer requirements');
bullet('Add availability calendar for providers');

subHeading('Phase 3 — Provider Detail Fields (Weeks 5–6)');
bullet('Extend equipment listing schema: brand, model, year, HP, registration, attachments');
bullet('Extend labour listing schema: max workers, crop experience');
bullet('Add "What work do you need?" question for equipment (bypasses HP knowledge)');

subHeading('Phase 4 — Booking Completion Flow (Weeks 7–8)');
bullet('OTP/arrival confirmation when provider reaches farm');
bullet('Work-completion confirmation by farmer');
bullet('Automatic payment release on completion');
bullet('Rating & review submission and display');

subHeading('Phase 5 — Polish & Testing (Weeks 9–10)');
bullet('End-to-end testing of all three service flows');
bullet('Provider-side dashboard (availability, incoming requests, earnings)');
bullet('Notification system (SMS/email for booking updates)');
bullet('Performance optimization for matching engine');

doc.moveDown(1);
divider();
doc.moveDown(0.5);

// Final note
doc.fontSize(9).fillColor(GRAY).font('Helvetica').text(
  'This report was generated by comparing the Krishi Sangam codebase (client/src, server/routes, server/sql) against the 15-point backend architecture specification provided.',
  { align: 'center', width: 450 }
);

doc.end();

stream.on('finish', () => {
  console.log('PDF generated: KrishiSangam_Comparison_Report.pdf');
});
