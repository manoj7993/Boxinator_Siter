const { Country, CountryMultiplierLog } = require('../models');
const Joi = require('joi');

const updateCountrySchema = Joi.object({
  name: Joi.string().max(100).optional(),
  code: Joi.string().length(3).optional(),
  multiplier: Joi.number().min(0).max(100).optional(),
  isSourceCountry: Joi.boolean().optional()
});

class SettingsController {
  static async getCountries(req, res, next) {
    try {
      // Since we're using Supabase API-only mode, we need to fetch from Supabase directly
      const { supabase } = require('../config/database');
      
      if (supabase) {
        const { data: countries, error } = await supabase
          .from('countries')
          .select('*')
          .order('name', { ascending: true });

        if (error) {
          throw new Error(error.message);
        }

        res.json({
          success: true,
          countries
        });
      } else {
        // Fallback to mock data if Supabase not available
        const countries = [
          { id: 1, name: 'United States', code: 'USA', multiplier: 1.00 },
          { id: 2, name: 'Canada', code: 'CAN', multiplier: 1.25 },
          { id: 3, name: 'United Kingdom', code: 'GBR', multiplier: 1.50 },
          { id: 4, name: 'Germany', code: 'DEU', multiplier: 1.45 },
          { id: 5, name: 'France', code: 'FRA', multiplier: 1.40 }
        ];

        res.json({
          success: true,
          countries
        });
      }
    } catch (error) {
      next(error);
    }
  }

  static async getBoxTypes(req, res, next) {
    try {
      // Since we're using Supabase API-only mode, we need to fetch from Supabase directly
      const { supabase } = require('../config/database');
      
      if (supabase) {
        const { data: boxTypes, error } = await supabase
          .from('box_types')
          .select('*')
          .order('base_cost', { ascending: true });

        if (error) {
          console.log('Box types table not found, using fallback data');
          // Fallback to hardcoded data since table doesn't exist
          const boxTypes = [
            { id: 1, name: 'Small', size: '20x20x15 cm', base_cost: 15.99 },
            { id: 2, name: 'Medium', size: '30x25x20 cm', base_cost: 25.99 },
            { id: 3, name: 'Large', size: '40x35x30 cm', base_cost: 39.99 },
            { id: 4, name: 'Extra Large', size: '50x45x40 cm', base_cost: 59.99 }
          ];

          res.json({
            success: true,
            boxTypes
          });
        } else {
          res.json({
            success: true,
            boxTypes
          });
        }
      } else {
        // Fallback to mock data if Supabase not available
        const boxTypes = [
          { id: 1, name: 'Small', size: '20x20x15 cm', base_cost: 15.99 },
          { id: 2, name: 'Medium', size: '30x25x20 cm', base_cost: 25.99 },
          { id: 3, name: 'Large', size: '40x35x30 cm', base_cost: 39.99 },
          { id: 4, name: 'Extra Large', size: '50x45x40 cm', base_cost: 59.99 }
        ];

        res.json({
          success: true,
          boxTypes
        });
      }
    } catch (error) {
      next(error);
    }
  }

  static async updateCountry(req, res, next) {
    try {
      // Only administrators can update country settings
      if (req.user.accountType !== 'ADMINISTRATOR') {
        return res.status(403).json({
          success: false,
          message: 'Administrator access required'
        });
      }

      const { id } = req.params;
      const { error, value } = updateCountrySchema.validate(req.body);
      
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details
        });
      }

      const country = await Country.findByPk(id);
      if (!country) {
        return res.status(404).json({
          success: false,
          message: 'Country not found'
        });
      }

      // Log multiplier changes
      if (value.multiplier && value.multiplier !== country.multiplier) {
        await CountryMultiplierLog.create({
          countryId: country.id,
          oldMultiplier: country.multiplier,
          newMultiplier: value.multiplier,
          changedByUserId: req.user.id,
          reason: req.body.reason || 'Administrative update'
        });
      }

      await country.update(value);

      res.json({
        success: true,
        message: 'Country updated successfully',
        country
      });
    } catch (error) {
      next(error);
    }
  }

  static async createCountry(req, res, next) {
    try {
      // Only administrators can create countries
      if (req.user.accountType !== 'ADMINISTRATOR') {
        return res.status(403).json({
          success: false,
          message: 'Administrator access required'
        });
      }

      const countrySchema = Joi.object({
        name: Joi.string().max(100).required(),
        code: Joi.string().length(3).required(),
        multiplier: Joi.number().min(0).max(100).required(),
        isSourceCountry: Joi.boolean().default(false)
      });

      const { error, value } = countrySchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details
        });
      }

      const country = await Country.create(value);

      res.status(201).json({
        success: true,
        message: 'Country created successfully',
        country
      });
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({
          success: false,
          message: 'Country code already exists'
        });
      }
      next(error);
    }
  }
}

module.exports = SettingsController;
