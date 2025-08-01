// Enhanced user service with Supabase API support
const { User, UserProfile } = require('../models');
const { supabase } = require('../config/database');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

class SupabaseUserService {
  /**
   * Check if we're in API-only mode
   */
  static isApiOnlyMode() {
    return process.env.USE_SUPABASE_API_ONLY === 'true';
  }

  /**
   * Register a new user using Supabase API
   */
  static async registerUser(userData) {
    const { email, password, firstName, lastName, dateOfBirth, countryOfResidence, zipCode, contactNumber } = userData;
    
    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);
    
    try {
      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();
      
      if (existingUser) {
        throw new Error('Email already registered');
      }
      
      // Create user record
      const { data: newUser, error: userError } = await supabase
        .from('users')
        .insert({
          email,
          password: passwordHash,
          role: 'customer',
          is_email_verified: true, // Set to true for development (no email service yet)
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (userError) {
        console.error('User creation error:', userError);
        throw new Error('Failed to create user');
      }
      
      // Create user profile
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          user_id: newUser.id,
          first_name: firstName,
          last_name: lastName,
          date_of_birth: dateOfBirth,
          country: countryOfResidence,
          postal_code: zipCode,
          phone: contactNumber,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (profileError) {
        console.error('Profile creation error:', profileError);
        // Try to cleanup user if profile creation failed
        await supabase.from('users').delete().eq('id', newUser.id);
        throw new Error('Failed to create user profile');
      }
      
      // Create email verification token
      const verificationToken = crypto.randomBytes(32).toString('hex');
      const { error: tokenError } = await supabase
        .from('email_verification_tokens')
        .insert({
          user_id: newUser.id,
          token: verificationToken,
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          created_at: new Date().toISOString()
        });
      
      if (tokenError) {
        console.error('Token creation error:', tokenError);
        // Continue anyway, token is optional for now
      }
      
      return { user: newUser, profile, verificationToken };
      
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  /**
   * Find user by email
   */
  static async findUserByEmail(email) {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select(`
          *,
          profile:user_profiles(*)
        `)
        .eq('email', email)
        .single();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        console.error('Find user error:', error);
        throw new Error('Database error');
      }
      
      return user;
    } catch (error) {
      console.error('Find user by email error:', error);
      return null;
    }
  }

  /**
   * Get user profile by ID
   */
  static async getUserProfile(userId) {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select(`
          id, email, role, is_email_verified, created_at,
          profile:user_profiles(first_name, last_name, date_of_birth, country, postal_code, phone)
        `)
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Get user profile error:', error);
        throw new Error('User not found');
      }
      
      return user;
    } catch (error) {
      console.error('Get user profile error:', error);
      throw error;
    }
  }
}

module.exports = SupabaseUserService;
