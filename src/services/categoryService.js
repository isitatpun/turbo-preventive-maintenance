import supabase from '../lib/supabase';

export const categoryService = {
  // Get all categories
  async getAll() {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (error) throw error;

      return data.map(cat => ({
        id: cat.id,
        name: cat.name,
        code: cat.code,
        color: cat.color,
        icon: cat.icon,
        description: cat.description,
        runNumber: cat.run_number
      }));
    } catch (error) {
      console.error('Get categories error:', error);
      throw error;
    }
  },

  // Create category
  async create(categoryData) {
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert({
          name: categoryData.name,
          code: categoryData.code,
          color: categoryData.color || '#6B7280',
          icon: categoryData.icon,
          description: categoryData.description,
          sort_order: categoryData.sortOrder || 0
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        name: data.name,
        code: data.code,
        color: data.color,
        icon: data.icon,
        description: data.description,
        runNumber: data.run_number
      };
    } catch (error) {
      console.error('Create category error:', error);
      throw error;
    }
  },

  // Update category
  async update(id, categoryData) {
    try {
      const updateData = {};
      if (categoryData.name !== undefined) updateData.name = categoryData.name;
      if (categoryData.code !== undefined) updateData.code = categoryData.code;
      if (categoryData.color !== undefined) updateData.color = categoryData.color;
      if (categoryData.icon !== undefined) updateData.icon = categoryData.icon;
      if (categoryData.description !== undefined) updateData.description = categoryData.description;

      const { data, error } = await supabase
        .from('categories')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        name: data.name,
        code: data.code,
        color: data.color,
        icon: data.icon,
        description: data.description,
        runNumber: data.run_number
      };
    } catch (error) {
      console.error('Update category error:', error);
      throw error;
    }
  },

  // Delete category (soft delete)
  async delete(id) {
    try {
      const { error } = await supabase
        .from('categories')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Delete category error:', error);
      throw error;
    }
  }
};

export default categoryService;