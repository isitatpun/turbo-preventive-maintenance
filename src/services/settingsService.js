import supabase from '../lib/supabase';

export const settingsService = {
  // Get all settings
  async getAll() {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .order('category');

      if (error) throw error;

      // Convert to key-value object
      const settings = {};
      data.forEach(setting => {
        settings[setting.key] = setting.value;
      });

      return settings;
    } catch (error) {
      console.error('Get settings error:', error);
      throw error;
    }
  },

  // Get setting by key
  async get(key) {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('value')
        .eq('key', key)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      return data?.value;
    } catch (error) {
      console.error('Get setting error:', error);
      throw error;
    }
  },

  // Update setting
  async update(key, value, updatedBy) {
    try {
      const { data, error } = await supabase
        .from('settings')
        .update({
          value: value,
          updated_by: updatedBy
        })
        .eq('key', key)
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Update setting error:', error);
      throw error;
    }
  },

  // Upsert setting (create or update)
  async set(key, value, category = 'general', updatedBy = null) {
    try {
      const { data, error } = await supabase
        .from('settings')
        .upsert({
          key,
          value,
          category,
          updated_by: updatedBy
        }, {
          onConflict: 'key'
        })
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Set setting error:', error);
      throw error;
    }
  }
};

export default settingsService;