const { sequelize, Country, BoxType } = require('../models');

async function seedInitialData() {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully');

    // Seed Box Types (according to SRS)
    const boxTypes = [
      { name: 'Small', size: '20x20x20 cm', baseCost: 15.00 },
      { name: 'Medium', size: '30x30x30 cm', baseCost: 25.00 },
      { name: 'Large', size: '40x40x40 cm', baseCost: 35.00 },
      { name: 'Extra Large', size: '50x50x50 cm', baseCost: 50.00 }
    ];

    for (const boxType of boxTypes) {
      await BoxType.findOrCreate({
        where: { name: boxType.name },
        defaults: boxType
      });
    }

    // Seed some sample countries with multipliers
    const countries = [
      { name: 'Sweden', code: 'SWE', multiplier: 1.0 }, // Source country
      { name: 'Norway', code: 'NOR', multiplier: 1.2 },
      { name: 'Denmark', code: 'DNK', multiplier: 1.1 },
      { name: 'Finland', code: 'FIN', multiplier: 1.3 },
      { name: 'Germany', code: 'DEU', multiplier: 1.5 },
      { name: 'United Kingdom', code: 'GBR', multiplier: 1.7 },
      { name: 'France', code: 'FRA', multiplier: 1.6 },
      { name: 'Spain', code: 'ESP', multiplier: 1.8 },
      { name: 'Italy', code: 'ITA', multiplier: 1.9 },
      { name: 'Netherlands', code: 'NLD', multiplier: 1.4 },
      { name: 'United States', code: 'USA', multiplier: 2.5 },
      { name: 'Canada', code: 'CAN', multiplier: 2.3 },
      { name: 'Australia', code: 'AUS', multiplier: 3.0 },
      { name: 'Japan', code: 'JPN', multiplier: 2.8 },
      { name: 'China', code: 'CHN', multiplier: 2.2 }
    ];

    for (const country of countries) {
      await Country.findOrCreate({
        where: { code: country.code },
        defaults: country
      });
    }

    console.log('Initial data seeded successfully');
    console.log(`Seeded ${boxTypes.length} box types and ${countries.length} countries`);
    
  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await sequelize.close();
  }
}

// Run if called directly
if (require.main === module) {
  seedInitialData();
}

module.exports = seedInitialData;
