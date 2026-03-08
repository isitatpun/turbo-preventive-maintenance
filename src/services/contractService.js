import supabase from '../lib/supabase';

export const contractService = {
  async getAll() {
    const { data, error } = await supabase
      .from('contracts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(row => this._map(row));
  },

  async create(contractData) {
    const { data, error } = await supabase
      .from('contracts')
      .insert({
        supplier_name: contractData.supplierName,
        description: contractData.description || null,
        start_date: contractData.startDate,
        end_date: contractData.endDate,
        contract_value: contractData.contractValue || null,
        contact_person: contractData.contactPerson || null,
        phone: contractData.phone || null,
        email: contractData.email || null,
        notes: contractData.notes || null,
        category_id: contractData.categoryId || null,
        status: 'active',
        created_by: contractData.createdBy
      })
      .select('*')
      .single();

    if (error) throw error;
    return this._map(data);
  },

  async renew(id, startDate, endDate) {
    const { data, error } = await supabase
      .from('contracts')
      .update({
        start_date: startDate,
        end_date: endDate,
        status: 'active'
      })
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;
    return this._map(data);
  },

  async cancel(id, userId) {
    const { data, error } = await supabase
      .from('contracts')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        cancelled_by: userId
      })
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;
    return this._map(data);
  },

  _map(row) {
    return {
      id: row.id,
      supplierName: row.supplier_name,
      description: row.description,
      startDate: row.start_date,
      endDate: row.end_date,
      contractValue: row.contract_value,
      contactPerson: row.contact_person,
      phone: row.phone,
      email: row.email,
      notes: row.notes,
      categoryId: row.category_id,
      status: row.status,
      cancelledAt: row.cancelled_at,
      cancelledBy: row.cancelled_by,
      createdBy: row.created_by,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
};

export default contractService;
