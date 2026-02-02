import supabase from '../lib/supabase';

export const locationService = {
  // Get all locations
  async getAll() {
    try {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (error) throw error;

      return data.map(loc => ({
        id: loc.id,
        name: loc.name,
        code: loc.code,
        building: loc.building,
        floor: loc.floor,
        zone: loc.zone,
        description: loc.description,
        runNumber: loc.run_number
      }));
    } catch (error) {
      console.error('Get locations error:', error);
      throw error;
    }
  },

  // Create location
  async create(locationData) {
    try {
      const { data, error } = await supabase
        .from('locations')
        .insert({
          name: locationData.name,
          code: locationData.code,
          building: locationData.building,
          floor: locationData.floor,
          zone: locationData.zone,
          description: locationData.description,
          sort_order: locationData.sortOrder || 0
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        name: data.name,
        code: data.code,
        building: data.building,
        floor: data.floor,
        zone: data.zone,
        description: data.description,
        runNumber: data.run_number
      };
    } catch (error) {
      console.error('Create location error:', error);
      throw error;
    }
  },

  // Update location
  async update(id, locationData) {
    try {
      const updateData = {};
      if (locationData.name !== undefined) updateData.name = locationData.name;
      if (locationData.code !== undefined) updateData.code = locationData.code;
      if (locationData.building !== undefined) updateData.building = locationData.building;
      if (locationData.floor !== undefined) updateData.floor = locationData.floor;
      if (locationData.zone !== undefined) updateData.zone = locationData.zone;
      if (locationData.description !== undefined) updateData.description = locationData.description;

      const { data, error } = await supabase
        .from('locations')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        name: data.name,
        code: data.code,
        building: data.building,
        floor: data.floor,
        zone: data.zone,
        description: data.description,
        runNumber: data.run_number
      };
    } catch (error) {
      console.error('Update location error:', error);
      throw error;
    }
  },

  // Delete location (soft delete)
  async delete(id) {
    try {
      const { error } = await supabase
        .from('locations')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Delete location error:', error);
      throw error;
    }
  }
};

export default locationService;