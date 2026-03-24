import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Article from '../models/article.js';

dotenv.config();

const IMAGES = [
  'https://res.cloudinary.com/dxnb2ozgw/image/upload/v1772174793/fcd48718-1c40-484c-8c50-63a1c6640930.png',
  'https://res.cloudinary.com/dxnb2ozgw/image/upload/v1772175765/4569b7cf-0df7-497e-81b4-dabc333985fc.png',
  'https://res.cloudinary.com/dxnb2ozgw/image/upload/v1772175156/c75fec02-207c-4d20-aac7-6724cad49cd2.png',
  'https://res.cloudinary.com/dxnb2ozgw/image/upload/v1772174827/f45dce54-b95f-46ee-ab66-1a9217d124c9.png',
  'https://res.cloudinary.com/dxnb2ozgw/image/upload/v1772174813/f4977c60-c6a1-4f41-ad14-7bdb434e3a76.png',
];

const articles = [
  {
    title: 'Tour de France: The Greatest Race on Earth',
    subtitle: 'Three weeks, 21 stages, and 3,400 kilometers of pure suffering and glory',
    author: 'EndurACE Editorial',
    readTime: '8 min read',
    featuredImage: IMAGES[0],
    content: {
      intro: 'Every July, the world\'s greatest cyclists descend on France for the most prestigious race in professional cycling. The Tour de France is not merely a bike race — it is a cultural institution, a test of human endurance, and the pinnacle of the cycling calendar.',
      sections: [
        {
          heading: 'A History of Champions',
          body: 'Since its founding in 1903 by Henri Desgrange as a newspaper circulation stunt, the Tour has grown into one of the most-watched annual sporting events on the planet. From the cobblestone climbs of the early editions to the modern aerodynamic battles on Alpine passes, the race has always demanded absolute excellence.',
          images: [IMAGES[1], IMAGES[2]],
          listItems: ['21 stages over 23 days', 'Roughly 3,400 km of racing', 'Climbs exceeding 2,000m altitude', 'Prize purse of €2.3 million'],
        },
        {
          heading: 'The Iconic Jerseys',
          body: 'The Tour de France features four classification jerseys that have become iconic symbols in world sport. The yellow jersey (maillot jaune) leads the general classification, while the green jersey rewards the best sprinter, the polka dot jersey goes to the King of the Mountains, and the white jersey recognizes the best young rider under 26.',
          images: [IMAGES[3]],
          listItems: [],
        },
        {
          heading: 'What It Takes to Compete',
          body: 'Tour competitors typically weigh between 60-70kg and produce over 400 watts sustained on major climbs. A grand tour rider burns approximately 8,000 calories per stage day. The training volume leading into the Tour can reach 30,000+ kilometers annually.',
          images: [IMAGES[4], IMAGES[0]],
          listItems: ['VO2 max above 80 ml/kg/min', 'Power-to-weight ratio of 6+ W/kg', 'Months of altitude training', 'Strict nutritional periodization'],
        },
      ],
    },
    publishedAt: new Date('2025-06-15'),
  },
  {
    title: 'IRONMAN World Championship: Kona and the Lava Fields',
    subtitle: 'The original iron distance — 140.6 miles of swimming, cycling, and running in Hawaiian heat',
    author: 'EndurACE Editorial',
    readTime: '10 min read',
    featuredImage: IMAGES[1],
    content: {
      intro: 'On the black lava fields of the Big Island of Hawaii, every October, the world\'s toughest triathletes converge on Kailua-Kona for the IRONMAN World Championship. Born from a barroom argument in 1977 about who was the fittest athlete — swimmers, cyclists, or runners — the IRONMAN has become the ultimate test of human endurance.',
      sections: [
        {
          heading: 'The Course',
          body: 'The IRONMAN World Championship begins with a 3.86km ocean swim in Kailua Bay, followed by a 180.25km bike ride on the Queen Ka\'ahumanu Highway through volcanic lava fields, and concludes with a full 42.2km marathon along the Natural Energy Lab road. Athletes face temperatures exceeding 38°C and relentless trade winds.',
          images: [IMAGES[2], IMAGES[3]],
          listItems: ['3.86km ocean swim', '180.25km bike ride', '42.2km run', 'Cut-off time: 17 hours'],
        },
        {
          heading: 'The History of Kona',
          body: 'The first IRONMAN took place on February 18, 1978, with 15 starters and 12 finishers. Gordon Haller became the first IRONMAN champion in 11 hours, 46 minutes. Today, the race draws thousands of qualifiers from over 100 countries, each having earned their slot at qualifying events worldwide.',
          images: [IMAGES[4]],
          listItems: [],
        },
        {
          heading: 'Gear for the Lava Fields',
          body: 'Racing in Kona demands specialized equipment. Aero helmets, deep-section carbon wheels, and triathlon-specific wetsuits (for swim start) are essential. Nutrition planning is critical — athletes consume 80-100g of carbohydrates per hour and 500-700ml of fluids per hour on the bike.',
          images: [IMAGES[0], IMAGES[1]],
          listItems: ['Aero road or tri bike', 'Carbon deep-section wheels', 'Ventilated run shoes', 'Cooling arm sleeves for the run'],
        },
      ],
    },
    publishedAt: new Date('2025-07-20'),
  },
  {
    title: 'IRONMAN 70.3: The Half Distance Revolution',
    subtitle: 'Making iron distance racing accessible without compromising the challenge',
    author: 'EndurACE Editorial',
    readTime: '7 min read',
    featuredImage: IMAGES[2],
    content: {
      intro: 'The IRONMAN 70.3 series has democratized long-course triathlon racing. With 113km of total racing — half the full iron distance — the 70.3 format offers a supreme challenge that is achievable for dedicated age-group athletes while providing a pathway to the full IRONMAN distance.',
      sections: [
        {
          heading: 'The 70.3 Format',
          body: 'A 70.3 race consists of a 1.9km swim, 90km bike ride, and 21.1km half marathon run. The number 70.3 refers to the total distance in miles. With a cut-off of 8.5 hours, the event challenges athletes across all three disciplines while remaining achievable with 6-12 months of structured training.',
          images: [IMAGES[3], IMAGES[4]],
          listItems: ['1.9km swim', '90km bike', '21.1km run', '8.5 hour cut-off'],
        },
        {
          heading: 'Global Race Venues',
          body: 'The 70.3 series spans over 100 races across 50+ countries annually. From the Philippines (Subic Bay, Davao) to the beaches of the Algarve in Portugal, each race offers a unique combination of terrain, climate, and local culture. The IRONMAN 70.3 World Championship alternates between venues each year.',
          images: [IMAGES[0], IMAGES[1]],
          listItems: [],
        },
        {
          heading: 'Training for Your First 70.3',
          body: 'Most first-time 70.3 athletes require 4-6 months of structured training. A typical training week during the build phase includes 3 swim sessions, 3-4 bike sessions, and 3-4 run sessions totaling 12-15 hours per week. The key is building an aerobic base before introducing race-pace intensity.',
          images: [IMAGES[2]],
          listItems: ['Build aerobic base first', 'Brick workouts are essential', 'Practice open water swimming', 'Master your race nutrition strategy'],
        },
      ],
    },
    publishedAt: new Date('2025-08-01'),
  },
  {
    title: 'Ultra-Trail du Mont-Blanc: 170km Around the Alps',
    subtitle: 'The world\'s most iconic ultramarathon circles the highest peak in Western Europe',
    author: 'EndurACE Editorial',
    readTime: '9 min read',
    featuredImage: IMAGES[3],
    content: {
      intro: 'The Ultra-Trail du Mont-Blanc (UTMB) is widely considered the most prestigious ultramarathon in the world. Circling the Mont Blanc massif through France, Italy, and Switzerland, the 170km course with 10,000m of elevation gain must be completed within 46.5 hours. It is a race that breaks bodies and forges legends.',
      sections: [
        {
          heading: 'The Route',
          body: 'Starting and finishing in Chamonix, France, the UTMB route traverses high alpine terrain through three countries. Notable sections include the Grand Col Ferret on the Swiss-Italian border, the Courmayeur valley in Italy, and the final descent into Chamonix under the watch of thousands of spectators lining the finish chute.',
          images: [IMAGES[4], IMAGES[0]],
          listItems: ['170km total distance', '10,000m positive elevation', 'Passes through France, Italy, Switzerland', '46.5 hour cut-off time'],
        },
        {
          heading: 'Mandatory Kit',
          body: 'UTMB has strict mandatory equipment requirements to ensure athlete safety in high-mountain terrain. Every runner must carry a fully charged phone, emergency bivouac, warm jacket, waterproof jacket and trousers, warm hat, and gloves at all times. Course marshals check gear at checkpoints.',
          images: [IMAGES[1]],
          listItems: ['Emergency bivouac bag', 'Waterproof jacket and trousers', 'Warm mid-layer', 'Headlamp with spare batteries', 'Food reserve (200kcal minimum)'],
        },
        {
          heading: 'Training for UTMB',
          body: 'Elite UTMB runners log 150-200km per week with 10,000-15,000m of vertical gain during peak training. For age-group runners, building to 80-100km per week with consistent vertical training over 12-18 months is recommended. Night running training is essential given that most athletes will run through at least one full night.',
          images: [IMAGES[2], IMAGES[3]],
          listItems: [],
        },
      ],
    },
    publishedAt: new Date('2025-08-20'),
  },
  {
    title: 'The Marathon: 42.195km of Human Achievement',
    subtitle: 'From the plains of Marathon to the streets of Tokyo — the race that started it all',
    author: 'EndurACE Editorial',
    readTime: '6 min read',
    featuredImage: IMAGES[4],
    content: {
      intro: 'The marathon is the crown jewel of road running. At 42.195 kilometers, it represents the ultimate test for recreational runners and the most prestigious distance for professional athletes. From its mythological origins to the sub-2-hour barrier broken by Eliud Kipchoge, the marathon continues to inspire millions of people worldwide.',
      sections: [
        {
          heading: 'The Six World Marathon Majors',
          body: 'The Abbott World Marathon Majors series comprises six races: Tokyo, Boston, London, Berlin, Chicago, and New York City. Completing all six earns runners the prestigious Six Star Finisher medal. Combined, these races attract over 250,000 runners and millions of spectators annually.',
          images: [IMAGES[0], IMAGES[1]],
          listItems: ['Tokyo Marathon (March)', 'Boston Marathon (April)', 'London Marathon (April)', 'Berlin Marathon (September)', 'Chicago Marathon (October)', 'New York City Marathon (November)'],
        },
        {
          heading: 'Training Principles',
          body: 'Marathon training typically spans 16-20 weeks for experienced runners. The key training elements are the weekly long run (peaking at 32-35km), tempo runs at marathon pace, and easy aerobic mileage. Most plans peak at 60-90km per week for competitive age-groupers.',
          images: [IMAGES[2]],
          listItems: ['16-20 week training cycle', 'Long runs up to 35km', 'Two quality sessions per week', 'Taper for 2-3 weeks before race day'],
        },
        {
          heading: 'Race Day Nutrition',
          body: 'Carbohydrate loading in the final 2-3 days before a marathon tops up glycogen stores. During the race, consuming 60-90g of carbohydrates per hour from gels, chews, or sports drinks delays the onset of "the wall" — the glycogen depletion that causes dramatic slowing after 30km.',
          images: [IMAGES[3], IMAGES[4]],
          listItems: [],
        },
      ],
    },
    publishedAt: new Date('2025-09-05'),
  },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');

    await Article.deleteMany({});
    console.log('Existing articles cleared');

    const inserted = await Article.insertMany(articles);
    console.log(`✓ ${inserted.length} articles seeded successfully`);
    inserted.forEach((a) => console.log(`  - ${a.title}`));
  } catch (error) {
    console.error('Seeder error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
    process.exit(0);
  }
};

seed();