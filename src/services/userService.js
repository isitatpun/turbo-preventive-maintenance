import supabase from '../lib/supabase';

export const userService = {
  // Get all users
  async getAll() {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data.map(user => ({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone,
        avatarUrl: user.avatar_url,
        isActive: user.is_active,
        runNumber: user.run_number,
        lastLoginAt: user.last_login_at,
        createdAt: user.created_at
      }));
    } catch (error) {
      console.error('Get users error:', error);
      throw error;
    }
  },

  // Get user by ID
  async getById(id) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      return data ? {
        id: data.id,
        email: data.email,
        name: data.name,
        role: data.role,
        phone: data.phone,
        avatarUrl: data.avatar_url,
        isActive: data.is_active,
        runNumber: data.run_number
      } : null;
    } catch (error) {
      console.error('Get user by ID error:', error);
      throw error;
    }
  },

  // Get technicians only
  async getTechnicians() {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'technician')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;

      return data.map(user => ({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone,
        isActive: user.is_active,
        runNumber: user.run_number
      }));
    } catch (error) {
      console.error('Get technicians error:', error);
      throw error;
    }
  },

  // Create user
  async create(userData) {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert({
          email: userData.email.toLowerCase(),
          password_hash: '$2a$10$rQEY8t5JxKXHx6WoWxvCxOzDJcPaVdOoGdGH.ZgGNGh6YhFYwXKFi', // Demo password
          name: userData.name,
          role: userData.role || 'technician',
          phone: userData.phone,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        email: data.email,
        name: data.name,
        role: data.role,
        phone: data.phone,
        isActive: data.is_active,
        runNumber: data.run_number
      };
    } catch (error) {
      console.error('Create user error:', error);
      throw error;
    }
  },

  // Update user
  async update(id, userData) {
    try {
      const updateData = {};
      if (userData.name !== undefined) updateData.name = userData.name;
      if (userData.email !== undefined) updateData.email = userData.email.toLowerCase();
      if (userData.role !== undefined) updateData.role = userData.role;
      if (userData.phone !== undefined) updateData.phone = userData.phone;
      if (userData.isActive !== undefined) updateData.is_active = userData.isActive;

      const { data, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        email: data.email,
        name: data.name,
        role: data.role,
        phone: data.phone,
        isActive: data.is_active,
        runNumber: data.run_number
      };
    } catch (error) {
      console.error('Update user error:', error);
      throw error;
    }
  },

  // Delete user (soft delete)
  async delete(id) {
    try {
      const { error } = await supabase
        .from('users')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Delete user error:', error);
      throw error;
    }
  }
};

export default userService;