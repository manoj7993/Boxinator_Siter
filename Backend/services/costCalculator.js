// src/services/costCalculator.js
const { Country, BoxType } = require('../models');

class CostCalculator {
  /**
   * Calculate shipping cost based on destination and box type
   */
  static async calculateCost(countryId, boxTypeId) {
    try {
      // Get country with multiplier
      const country = await Country.findByPk(countryId);
      if (!country) {
        throw new Error('Invalid destination country');
      }

      // Get box type pricing
      const boxType = await BoxType.findByPk(boxTypeId);
      if (!boxType) {
        throw new Error('Invalid box type');
      }

      // Calculate final cost: base price * country multiplier
      const baseCost = parseFloat(boxType.baseCost);
      const multiplier = parseFloat(country.multiplier);
      const finalCost = baseCost * multiplier;

      return {
        baseCost,
        multiplier,
        finalCost: parseFloat(finalCost.toFixed(2)),
        currency: 'USD', // or get from config
        country: country.name,
        boxType: boxType.name
      };
    } catch (error) {
      throw new Error(`Cost calculation failed: ${error.message}`);
    }
  }

  /**
   * Validate box type ID
   */
  static async validateBoxType(boxTypeId) {
    const boxType = await BoxType.findByPk(boxTypeId);
    return !!boxType;
  }

  /**
   * Get all available weight tiers with pricing
   */
  static async getWeightTiers() {
    try {
      const tiers = await WeightTier.findAll({
        order: [['price', 'ASC']]
      });
      return tiers;
    } catch (error) {
      throw new Error(`Failed to get weight tiers: ${error.message}`);
    }
  }

  /**
   * Get estimated delivery time (placeholder implementation)
   */
  static estimateDeliveryTime(destinationCountryId) {
    // This would typically integrate with shipping APIs
    // For now, return estimated days based on distance/region
    const estimates = {
      // Domestic
      1: { min: 2, max: 5, unit: 'business days' },
      // International - nearby countries
      2: { min: 5, max: 10, unit: 'business days' },
      // International - distant countries
      default: { min: 7, max: 14, unit: 'business days' }
    };

    return estimates[destinationCountryId] || estimates.default;
  }
}

module.exports = CostCalculator;
