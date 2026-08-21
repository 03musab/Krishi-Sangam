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
const LIGHT_BG = '#f8fafc';

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
  checkPageBreak(70);
  doc.moveDown(0.5);
  doc.fontSize(13).fillColor(GREEN).font('Helvetica-Bold').text(`${num}. ${text}`);
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

function statusComparisonLine(label, prevStatus, currentStatus, detail) {
  const prevColor = prevStatus === 'DONE' ? GREEN : prevStatus === 'PARTIAL' ? ORANGE : RED;
  const currColor = currentStatus === 'DONE' ? GREEN : currentStatus === 'PARTIAL' ? ORANGE : RED;

  doc.fontSize(9).font('Helvetica-Bold').fillColor(DARK).text(`  ${label}: `, { continued: true })
    .fillColor(prevColor).text(`[WAS: ${prevStatus}] `, { continued: true })
    .fillColor(currColor).text(`➔ [NOW: ${currentStatus}]`, { continued: true })
    .fillColor(GRAY).font('Helvetica').text(` — ${detail}`);
  doc.moveDown(0.15);
}

function checkPageBreak(needed) {
  if (doc.y + needed > 740) doc.addPage();
}

function divider() {
  doc.moveDown(0.3);
  doc.strokeColor('#e2e8f0').lineWidth(0.5).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
  doc.moveDown(0.3);
}

// ══════════════════════════════════════════════════════════
//  PAGE 1: COVER
// ══════════════════════════════════════════════════════════
doc.moveDown(5);
title('Krishi Sangam');
subtitle('Feature Architecture Comparison Report — Final Verification');
doc.moveDown(1);
doc.fontSize(10).fillColor(GRAY).font('Helvetica').text(
  'Comparison of Baseline vs. Current Full Implementation\nAgainst 15-Point Backend Architecture Specification',
  { align: 'center', lineGap: 4 }
);
doc.moveDown(2);
doc.fontSize(9.5).fillColor(GREEN).font('Helvetica-Bold').text(
  'Status: 100% Complete (15 of 15 Requirements Fulfilled)',
  { align: 'center' }
);
doc.moveDown(1);
doc.fontSize(9).fillColor(GRAY).font('Helvetica').text('Report Generated: August 20, 2026', { align: 'center' });
doc.moveDown(0.3);
doc.text('Codebase: Krishi-Sangam (React + Node.js + Express + PostgreSQL)', { align: 'center' });

doc.addPage();

// ══════════════════════════════════════════════════════════
//  EXECUTIVE SUMMARY
// ══════════════════════════════════════════════════════════
title('Executive Summary & Comparison Matrix');
doc.moveDown(0.3);

body('This updated report evaluates the completed Krishi Sangam platform implementation against the original 15-point backend architecture specification (the "Swiggy for Agriculture" marketplace model).');
doc.moveDown(0.2);
body('In the initial baseline audit, only frontend static forms existed, and key backend engines (25 km geolocation matching, provider availability calendar, smart "My Farm" selector, OTP arrival confirmation, escrow payment UI, and rating/review systems) were either PARTIAL or NOT DONE.');
doc.moveDown(0.2);
body('Following full feature implementation, all 15 points have been successfully built, integrated, and verified end-to-end across database migrations, Express API routes, and React frontend components.');
doc.moveDown(0.5);

// Summary table
subHeading('Overall Status Matrix (Baseline vs. Current)');
doc.moveDown(0.3);

const summaryItems = [
  ['1. Platform concept (Swiggy marketplace)', 'PARTIAL', 'DONE', '25km matching engine connects farmers with nearby providers'],
  ['2. Equipment Rental flow (Tractor + Operator)', 'PARTIAL', 'DONE', 'Tractor+Operator policy enforced, HP & attachment filters active'],
  ['3. Labour booking flow (Capacity matching)', 'PARTIAL', 'DONE', 'Matches providers by worker team size & 25km proximity'],
  ['4. Agricultural Services (Category matching)', 'PARTIAL', 'DONE', '9 categories matched with skill search & 25km radius'],
  ['5. Saved Farm Information', 'PARTIAL', 'DONE', 'SmartFarmSelector pre-fills saved profile farm details'],
  ['6. Smart booking (My Farm vs Other Farm)', 'NOT DONE', 'DONE', 'Farmer selects My Farm / Other Farm before every booking'],
  ['7. Service-specific questions', 'PARTIAL', 'DONE', 'HP range, attachments, worker team size, & farm details captured'],
  ['8. 25 km provider matching system', 'NOT DONE', 'DONE', 'Haversine formula matching engine filters providers by radius'],
  ['9. Provider extended catalogue', 'PARTIAL', 'DONE', 'Brand, model, year, reg number, attachments & distance added'],
  ['10. Provider availability calendar', 'NOT DONE', 'DONE', 'Calendar table & UI created; skips blocked dates in matching'],
  ['11. Complete lifecycle booking flow', 'PARTIAL', 'DONE', 'Smart Farm ➔ 25km Match ➔ Escrow ➔ OTP Arrival ➔ Complete ➔ Review'],
  ['12. One common matching engine', 'NOT DONE', 'DONE', 'Unified matching endpoints for equipment, labour, and services'],
  ['13. Provider catalogue collection', 'PARTIAL', 'DONE', 'Forms in ListEquipment & ListLabour capture full specs'],
  ['14. Escrow payment, OTP & Reviews', 'PARTIAL', 'DONE', 'EscrowPaymentModal, 4-digit OTP verify & RatingReviewModal active'],
  ['15. One-Sentence Summary vision', 'PARTIAL', 'DONE', 'Full "Swiggy for Agriculture" backend & frontend operational'],
];

summaryItems.forEach(([label, prev, curr, detail]) => {
  checkPageBreak(30);
  statusComparisonLine(label, prev, curr, detail);
});

doc.addPage();

// ══════════════════════════════════════════════════════════
//  SECTION-BY-SECTION DETAILED COMPARISON
// ══════════════════════════════════════════════════════════
title('Section-by-Section Detailed Audit');

// ── 1. Platform Concept ──
sectionHeading(1, 'Platform Concept — "Swiggy for Agriculture"');
subHeading('Specification requirement:');
bullet('Connects farmers with registered service providers behind the scenes');
bullet('Three service types: Equipment Rental, Labour, Agricultural Services');
bullet('Platform is a marketplace and booking platform, not actual service executor');
subHeading('Current implementation status:');
bullet('Backend engine (/api/services/book-equipment, /api/services/book-labour-team, /api/services/book-service) automatically searches nearby approved providers within 25 km and routes requests to them.');
bullet('Frontend presents unified booking components integrated with SmartFarmSelector and real-time distance sorting.');
statusComparisonLine('Final Status', 'PARTIAL', 'DONE', 'Full Swiggy marketplace matching engine operational');

// ── 2. Equipment Rental ──
sectionHeading(2, 'Equipment Rental — "Tractor + Operator Always"');
subHeading('Specification requirement:');
bullet('Tractor is ALWAYS provided WITH an operator/driver');
bullet('Farmer specifies HP, attachment, farm size, date/time, location');
bullet('Backend matches registered tractor providers near the farm');
subHeading('Current implementation status:');
bullet('Backend enforces with_operator = 1 filter in /api/services/book-equipment query.');
bullet('Supports hp_min, hp_max, attachment matching (rotavator, cultivator, plough), and farm size.');
bullet('Calculates Haversine proximity, checks calendar availability, and ranks providers by distance.');
statusComparisonLine('Final Status', 'PARTIAL', 'DONE', 'Tractor+Operator policy enforced with HP & attachment matching');

// ── 3. Labour ──
sectionHeading(3, 'Labour Booking — "Capacity & Worker Matching"');
subHeading('Specification requirement:');
bullet('Farmer specifies number of labourers required');
bullet('Backend finds labour providers who can supply that team size nearby');
subHeading('Current implementation status:');
bullet('Backend filters labour listings where team_size >= num_workers required.');
bullet('Ranks matching labour providers by closest capacity fit and 25 km Haversine proximity.');
statusComparisonLine('Final Status', 'PARTIAL', 'DONE', 'Capacity-based worker matching built and verified');

// ── 4. Agricultural Services ──
sectionHeading(4, 'Agricultural Services — Category & Skill Matching');
subHeading('Specification requirement:');
bullet('Farmer selects service category and details');
bullet('Backend finds appropriate registered service providers');
subHeading('Current implementation status:');
bullet('9 service categories implemented (Land Prep, Sowing, Spraying, Drones, Harvesting, etc.).');
bullet('Backend performs skill search and 25 km Haversine radius filtering to connect farmers with qualified providers.');
statusComparisonLine('Final Status', 'PARTIAL', 'DONE', 'Category & skill matching engine operational');

// ── 5. Saved Farm Information ──
sectionHeading(5, 'Saved Farm Information');
subHeading('Specification requirement:');
bullet('Store farmer profile details (village, district, farm size, soil type, irrigation, crop, access)');
bullet('Pre-fill farm details into booking forms when booking for own farm');
subHeading('Current implementation status:');
bullet('User profile stores village, taluka, district, state, farm_size, soil_type, main_crops, irrigation_type, farm_access.');
bullet('SmartFarmSelector automatically extracts and formats saved profile data for instant booking confirmation.');
statusComparisonLine('Final Status', 'PARTIAL', 'DONE', 'Farm profile seamlessly integrated into booking flow');

// ── 6. Smart Booking (My Farm vs Other Farm) ──
sectionHeading(6, 'Smart Booking — "My Farm" vs "Someone Else\'s Farm"');
subHeading('Specification requirement:');
bullet('Prompt "Who is this booking for?" before every booking');
bullet('If "My Farm": pre-fill saved profile details; if "Other Farm": collect full custom farm details');
subHeading('Current implementation status:');
bullet('SmartFarmSelector.jsx component added to all booking forms (Equipment, Labour, Services).');
bullet('Radio toggle allows single-click selection of saved farm or custom details collection.');
bullet('Stores farm_for ("my_farm" / "other_farm") and farm_details in database schema.');
statusComparisonLine('Final Status', 'NOT DONE', 'DONE', 'Smart farm selector component fully integrated');

doc.addPage();

// ── 7. Service-Specific Questions ──
sectionHeading(7, 'Service-Specific Questions');
subHeading('Specification requirement:');
bullet('Tractor: HP, attachments, farm size, location, work description');
bullet('Labour: worker count, team size, days, rate per worker');
bullet('Services: category, soil type, crop, work requirements');
subHeading('Current implementation status:');
bullet('BookEquipmentWithOperator captures HP min/max, attachments, farm size, work description.');
bullet('BookLabourTeam captures worker count, days, field size, rate per worker.');
bullet('ServiceBookingForm captures service category, sub-service, soil, crop, and job specifications.');
statusComparisonLine('Final Status', 'PARTIAL', 'DONE', 'Dynamic service-specific form fields implemented');

// ── 8. 25 km Matching System ──
sectionHeading(8, '25 km Provider Matching Engine');
subHeading('Specification requirement:');
bullet('Calculate distance between farmer location and provider location');
bullet('Filter providers within 25 km max distance (or provider custom radius)');
bullet('Check distance, capability, and date availability');
subHeading('Current implementation status:');
bullet('Haversine distance helper (getHaversineDistance) implemented in server/routes/services.js.');
bullet('Compares farmer lat/lng against provider lat/lng, enforcing distKm <= (max_distance || 25).');
bullet('Filters out unavailable providers by querying provider_availability table.');
statusComparisonLine('Final Status', 'NOT DONE', 'DONE', '25 km Haversine matching engine operational');

// ── 9. Provider Registration Details ──
sectionHeading(9, 'Provider Extended Catalogue');
subHeading('Specification requirement:');
bullet('Equipment: brand, model, year, HP, registration number, attachments list, max distance');
bullet('Labour: team size, work types, crop experience, max distance');
subHeading('Current implementation status:');
bullet('SQL Migration 003 added brand, model, year, registration_number, attachments_list, max_distance, crop_experience, work_types columns.');
bullet('ListEquipment.jsx and ListLabour.jsx provider creation forms updated to store extended specs.');
statusComparisonLine('Final Status', 'PARTIAL', 'DONE', 'Extended catalogue schema & provider UI complete');

// ── 10. Provider Availability Calendar ──
sectionHeading(10, 'Provider Availability Calendar');
subHeading('Specification requirement:');
bullet('Providers can mark specific dates as Available or Unavailable');
bullet('Backend automatically excludes unavailable providers during matching');
subHeading('Current implementation status:');
bullet('provider_availability table created with UNIQUE(provider_id, date) constraint.');
bullet('/api/availability routes and AvailabilityCalendar.jsx interactive UI component integrated into Profile page.');
bullet('Smart matching endpoints perform async date checks and skip blocked providers.');
statusComparisonLine('Final Status', 'NOT DONE', 'DONE', 'Availability calendar UI & matching filter complete');

// ── 11. Complete Booking Flow ──
sectionHeading(11, 'Complete Booking Lifecycle');
subHeading('Specification requirement:');
bullet('Farmer ➔ Selects Service ➔ Who is this for? ➔ Smart Match ➔ Provider Accepts ➔ Escrow Payment ➔ Provider Arrives ➔ OTP Verify ➔ Work Complete ➔ Release Payment ➔ Review');
subHeading('Current implementation status:');
bullet('End-to-end lifecycle built: Smart Farm selection ➔ 25 km match request ➔ Escrow payment via EscrowPaymentModal ➔ Provider inputs 4-digit OTP to start work ➔ Farmer/Provider completes work ➔ Escrow payment auto-released ➔ RatingReviewModal captures 1-5 star review.');
statusComparisonLine('Final Status', 'PARTIAL', 'DONE', 'Full 7-stage booking lifecycle implemented');

// ── 12. One Common Booking Engine ──
sectionHeading(12, 'One Common Booking & Matching Engine');
subHeading('Specification requirement:');
bullet('Unified matching architecture supporting Equipment, Labour, and Agricultural Services');
subHeading('Current implementation status:');
bullet('server/routes/services.js serves as unified matching backbone.');
bullet('Shared Haversine calculation, availability filtering, OTP verification, escrow release, and review submission across all service types.');
statusComparisonLine('Final Status', 'NOT DONE', 'DONE', 'Unified backend matching engine established');

doc.addPage();

// ── 13. Provider Equipment Catalogue ──
sectionHeading(13, 'Provider Catalogue Details');
subHeading('Specification requirement:');
bullet('Capture detailed machinery specifications, attachments, and operating bounds');
subHeading('Current implementation status:');
bullet('Listings API handles full equipment and labour catalogue data, enabling fine-grained search filters in search queries.');
statusComparisonLine('Final Status', 'PARTIAL', 'DONE', 'Catalogue data captured and queryable');

// ── 14. Payment, Completion & Rating ──
sectionHeading(14, 'Escrow Payment, OTP Arrival & Rating System');
subHeading('Specification requirement:');
bullet('Payment held safely in escrow ledger');
bullet('OTP verification upon provider arrival at farm');
bullet('Farmer confirms work completion to trigger payout release');
bullet('Rating and review system for quality control');
subHeading('Current implementation status:');
bullet('EscrowPaymentModal handles UPI, Card, and Cash Escrow holds.');
bullet('4-digit OTP code generated per booking; provider enters OTP via Bookings page to start work.');
bullet('Complete work action automatically updates status to completed and releases escrow payout.');
bullet('RatingReviewModal submits 1–5 star rating and comment; provider profile displays aggregate avg_rating and review count.');
statusComparisonLine('Final Status', 'PARTIAL', 'DONE', 'Escrow UI, OTP verification & Ratings fully active');

// ── 15. The One-Sentence Summary ──
sectionHeading(15, 'The One-Sentence Vision — Final Verification');
subHeading('Specification requirement:');
doc.fontSize(9.5).fillColor(BLUE).font('Helvetica-Oblique').text(
  '"Krishi Sangam should look to the farmer like one company providing agricultural equipment, labour and services, but behind the scenes it should work like Swiggy. We collect the farmer\'s requirement, find suitable registered providers within 25 km who are available and capable, send them the request, and once one provider accepts, we connect that provider with the farmer and manage the booking, payment, completion and rating."',
  { indent: 20, width: 480, lineGap: 3 }
);
doc.moveDown(0.3);
doc.fillColor(DARK).font('Helvetica');
subHeading('Final Implementation Audit Result:');
doc.fontSize(9.5).fillColor(GREEN).font('Helvetica-Bold').text(
  'VERIFIED 100% COMPLETE: The platform fully operates as specified. Farmers experience a unified "Swiggy for Agriculture" workflow backed by smart 25 km geolocation matching, provider availability calendar filtering, escrow payment security, OTP arrival confirmation, and provider ratings.',
  { indent: 20, width: 480, lineGap: 3 }
);

doc.moveDown(1);
divider();
doc.moveDown(0.5);

// Summary notes
doc.fontSize(9).fillColor(GRAY).font('Helvetica').text(
  'This report was generated following comprehensive code inspection and automated verification of client/src, server/routes, and server/sql.',
  { align: 'center', width: 450 }
);

doc.end();

stream.on('finish', () => {
  console.log('PDF successfully generated: KrishiSangam_Comparison_Report.pdf');
});
