// services/supabaseService.js
const { supabase } = require('../config/database');

class SupabaseService {
  /**
   * Get all users using Supabase client
   */
  static async getAllUsers() {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*');
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Supabase getAllUsers error:', error);
      throw error;
    }
  }

  /**
   * Create user using Supabase client
   */
  static async createUser(userData) {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert([userData])
        .select();
      
      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Supabase createUser error:', error);
      throw error;
    }
  }

  /**
   * Get user by ID using Supabase client
   */
  static async getUserById(id) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Supabase getUserById error:', error);
      throw error;
    }
  }

  /**
   * Update user using Supabase client
   */
  static async updateUser(id, updateData) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', id)
        .select();
      
      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Supabase updateUser error:', error);
      throw error;
    }
  }

  /**
   * Delete user using Supabase client
   */
  static async deleteUser(id) {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Supabase deleteUser error:', error);
      throw error;
    }
  }

  /**
   * Test Supabase connection
   */
  static async testConnection() {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('count', { count: 'exact' })
        .limit(0);
      
      if (error) throw error;
      return { connected: true, userCount: data.length };
    } catch (error) {
      console.error('Supabase connection test error:', error);
      throw error;
    }
  }

  /**
   * Execute raw SQL query using Supabase
   */
  static async executeQuery(query, params = []) {
    try {
      const { data, error } = await supabase.rpc('execute_sql', {
        query: query,
        params: params
      });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Supabase executeQuery error:', error);
      throw error;
    }
  }
}

module.exports = SupabaseService;
