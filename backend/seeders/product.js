import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/product.js';

dotenv.config();

const IMAGES = [
  'https://res.cloudinary.com/dxnb2ozgw/image/upload/v1772174793/fcd48718-1c40-484c-8c50-63a1c6640930.png',
  'https://res.cloudinary.com/dxnb2ozgw/image/upload/v1772175765/4569b7cf-0df7-497e-81b4-dabc333985fc.png',
  'https://res.cloudinary.com/dxnb2ozgw/image/upload/v1772175156/c75fec02-207c-4d20-aac7-6724cad49cd2.png',
  'https://res.cloudinary.com/dxnb2ozgw/image/upload/v1772174827/f45dce54-b95f-46ee-ab66-1a9217d124c9.png',
  'https://res.cloudinary.com/dxnb2ozgw/image/upload/v1772174813/f4977c60-c6a1-4f41-ad14-7bdb434e3a76.png',
];

const products = [
  // ── CYCLING ──────────────────────────────────────────────────────
  {
    name: 'Colnago Y1RS Carbon Road Bike',
    description: 'Ultra-lightweight carbon frame designed for elite road racing. Features aerodynamic tube profiles and integrated cable routing for a clean, fast build.',
    price: 245000, category: 'CYCLING', variation: 'Matte Black / Red', stock: 8,
    images: [IMAGES[0], IMAGES[1]],
  },
  {
    name: 'MET Rivale Road Helmet',
    description: 'MIPS-equipped aero helmet engineered for hot-weather endurance racing. Exceptional ventilation with a secure retention system.',
    price: 12500, category: 'CYCLING', variation: 'White / Blue', stock: 20,
    images: [IMAGES[2], IMAGES[3]],
  },
  {
    name: 'Shimano Dura-Ace R9200 Groupset',
    description: '12-speed electronic groupset delivering precise, instantaneous shifting. The benchmark for professional road cycling performance.',
    price: 89000, category: 'CYCLING', variation: 'Silver', stock: 5,
    images: [IMAGES[4], IMAGES[0]],
  },
  {
    name: 'Tabolu Triathlon Cycling Shoes',
    description: 'Stiff carbon sole and quick-lace system optimized for T1 transitions. Compatible with all major pedal systems.',
    price: 9800, category: 'CYCLING', variation: 'Black / Yellow', stock: 15,
    images: [IMAGES[1], IMAGES[2]],
  },
  {
    name: 'Castelli Free Aero Race Bib Shorts',
    description: 'Race-grade Italian bib shorts with KISS Air2 chamois. Used by WorldTour professionals for 200km+ rides.',
    price: 7200, category: 'CYCLING', variation: 'Black', stock: 25,
    images: [IMAGES[3], IMAGES[4]],
  },

  // ── SWIMMING ─────────────────────────────────────────────────────
  {
    name: 'TYR Venzo Jammer Racing Suit',
    description: 'FINA-approved competition jammer with DURAFAST ELITE fabric. Delivers superior compression and chlorine resistance for pool and open water.',
    price: 5500, category: 'SWIMMING', variation: 'Black / Red', stock: 30,
    images: [IMAGES[2], IMAGES[3]],
  },
  {
    name: 'Speedo Fastskin Pure Focus Goggles',
    description: 'Low-profile competition goggles with mirrored lenses. Hydrodynamic seal reduces drag during flip turns and starts.',
    price: 3200, category: 'SWIMMING', variation: 'Clear / Gold Mirror', stock: 40,
    images: [IMAGES[4], IMAGES[0]],
  },
  {
    name: 'HUUB Archimedes 3:3 Wetsuit',
    description: 'Elite open-water triathlon wetsuit with 3mm chest panel and 3mm legs for buoyancy and flexibility balance. FINA legal for triathlon.',
    price: 38000, category: 'SWIMMING', variation: 'Black / Blue', stock: 10,
    images: [IMAGES[1], IMAGES[2]],
  },
  {
    name: 'Finis Agility Floating Paddles',
    description: 'Strapless hand paddles that improve stroke mechanics through instant feedback. Essential tool for technique-focused swim training.',
    price: 1800, category: 'SWIMMING', variation: 'Blue', stock: 50,
    images: [IMAGES[3], IMAGES[4]],
  },
  {
    name: 'Blueseventy Nero TX Swim Cap',
    description: 'Thermal neoprene swim cap designed for cold open-water swimming. Reduces heat loss by 50% compared to standard silicone caps.',
    price: 950, category: 'SWIMMING', variation: 'Black', stock: 60,
    images: [IMAGES[0], IMAGES[1]],
  },

  // ── RUNNING ──────────────────────────────────────────────────────
  {
    name: 'Adidas Adizero Adios Pro 3',
    description: 'The fastest marathon shoe in the Adidas lineup. EnergyRods 2.0 carbon rods and Lightstrike Pro foam deliver record-breaking energy return.',
    price: 12000, category: 'RUNNING', variation: 'Solar Red / White', stock: 18,
    images: [IMAGES[4], IMAGES[0]],
  },
  {
    name: 'HOKA Speedgoat 5 Trail Shoe',
    description: 'Maximum cushion trail runner with Vibram Megagrip outsole. The shoe of choice for UTMB and Western States finishers.',
    price: 9500, category: 'RUNNING', variation: 'Fiesta / Coral', stock: 22,
    images: [IMAGES[1], IMAGES[2]],
  },
  {
    name: 'Salomon ADV Skin 12 Race Vest',
    description: '12-liter soft flask running vest with front storage pockets. Mandatory kit compliant for major ultramarathon events worldwide.',
    price: 8900, category: 'RUNNING', variation: 'Black', stock: 14,
    images: [IMAGES[3], IMAGES[4]],
  },
  {
    name: 'Nike Dri-FIT ADV Running Singlet',
    description: 'Sweat-wicking race singlet with perforated mesh panels. Worn by Nike elite athletes at major marathon majors.',
    price: 2800, category: 'RUNNING', variation: 'Volt / Black', stock: 35,
    images: [IMAGES[0], IMAGES[1]],
  },
  {
    name: 'Garmin Forerunner 965 GPS Watch',
    description: 'Premium multisport GPS watch with AMOLED display, full triathlon mode, training readiness score, and 31-hour GPS battery life.',
    price: 32000, category: 'RUNNING', variation: 'Carbon Gray DLC', stock: 12,
    images: [IMAGES[2], IMAGES[3]],
  },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');

    await Product.deleteMany({});
    console.log('Existing products cleared');

    const inserted = await Product.insertMany(products);
    console.log(`✓ ${inserted.length} products seeded successfully`);

    inserted.forEach((p) => console.log(`  - [${p.category}] ${p.name} — Php. ${p.price.toLocaleString()}`));
  } catch (error) {
    console.error('Seeder error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
    process.exit(0);
  }
};

seed();