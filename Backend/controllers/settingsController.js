const { Country, CountryMultiplierLog, BoxType } = require('../models');
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
      const countries = await Country.findAll({
        where: { isActive: true },
        order: [['name', 'ASC']]
      });

      res.json({
        success: true,
        countries
      });
    } catch (error) {
      next(error);
    }
  }

  static async getBoxTypes(req, res, next) {
    try {
      const boxTypes = await BoxType.findAll({
        where: { isActive: true },
        order: [['baseCost', 'ASC']]
      });

      res.json({
        success: true,
        boxTypes
      });
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
