import supabase from '../lib/supabase';

export const taskService = {
  // Get all tasks
  async getAll() {
    console.log('📥 Fetching all tasks...');
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          category:categories(id, name, color, code),
          location:locations(id, name, building, floor),
          assignee:users!tasks_assignee_id_fkey(id, name, email),
          submitter:users!tasks_submitted_by_fkey(id, name, email),
          approver:users!tasks_approved_by_fkey(id, name, email),
          creator:users!tasks_created_by_fkey(id, name, email)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Fetch tasks error:', error);
        throw error;
      }

      console.log('✅ Fetched tasks:', data?.length);
      return data.map(task => this._mapTask(task));
    } catch (error) {
      console.error('❌ Get tasks error:', error);
      throw error;
    }
  },

  // Create task
  async create(taskData) {
    console.log('📤 Creating task:', taskData);
    
    try {
      // Validate required fields
      if (!taskData.title) throw new Error('Title is required');
      if (!taskData.categoryId) throw new Error('Category is required');
      if (!taskData.locationId) throw new Error('Location is required');
      if (!taskData.dueDate) throw new Error('Due date is required');
      if (!taskData.createdBy) throw new Error('Created by is required');

      const insertData = {
        title: taskData.title,
        description: taskData.description || null,
        category_id: taskData.categoryId,
        location_id: taskData.locationId,
        due_date: taskData.dueDate,
        status: 'open',
        created_by: taskData.createdBy
      };

      console.log('📤 Insert data:', insertData);

      const { data, error } = await supabase
        .from('tasks')
        .insert(insertData)
        .select(`
          *,
          category:categories(id, name, color, code),
          location:locations(id, name, building, floor)
        `)
        .single();

      if (error) {
        console.error('❌ Create task error:', error);
        throw error;
      }

      console.log('✅ Task created:', data);
      return this._mapTask(data);
    } catch (error) {
      console.error('❌ Create task error:', error);
      throw error;
    }
  },

  // Bulk create tasks
  async bulkCreate(tasksData) {
    console.log('📤 Bulk creating tasks:', tasksData.length);
    
    try {
      const tasks = tasksData.map(task => ({
        title: task.title,
        description: task.description || null,
        category_id: task.categoryId,
        location_id: task.locationId,
        due_date: task.dueDate,
        status: 'open',
        created_by: task.createdBy
      }));

      console.log('📤 Bulk insert data:', tasks);

      const { data, error } = await supabase
        .from('tasks')
        .insert(tasks)
        .select(`
          *,
          category:categories(id, name, color, code),
          location:locations(id, name, building, floor)
        `);

      if (error) {
        console.error('❌ Bulk create error:', error);
        throw error;
      }

      console.log('✅ Bulk created:', data?.length);
      return data.map(task => this._mapTask(task));
    } catch (error) {
      console.error('❌ Bulk create error:', error);
      throw error;
    }
  },

  // Update task
  async update(id, taskData) {
    console.log('📤 Updating task:', id, taskData);
    
    try {
      const updateData = {};
      if (taskData.title !== undefined) updateData.title = taskData.title;
      if (taskData.description !== undefined) updateData.description = taskData.description;
      if (taskData.categoryId !== undefined) updateData.category_id = taskData.categoryId;
      if (taskData.locationId !== undefined) updateData.location_id = taskData.locationId;
      if (taskData.dueDate !== undefined) updateData.due_date = taskData.dueDate;
      if (taskData.status !== undefined) updateData.status = taskData.status;

      const { data, error } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', id)
        .select(`
          *,
          category:categories(id, name, color, code),
          location:locations(id, name, building, floor)
        `)
        .single();

      if (error) {
        console.error('❌ Update task error:', error);
        throw error;
      }

      console.log('✅ Task updated:', data);
      return this._mapTask(data);
    } catch (error) {
      console.error('❌ Update task error:', error);
      throw error;
    }
  },

  // Delete task
  async delete(id) {
    console.log('🗑️ Deleting task:', id);
    
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('❌ Delete task error:', error);
        throw error;
      }

      console.log('✅ Task deleted');
      return true;
    } catch (error) {
      console.error('❌ Delete task error:', error);
      throw error;
    }
  },

  // Claim task
  async claim(taskId, userId) {
    console.log('🤚 Claiming task:', taskId, 'by user:', userId);
    
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update({
          assignee_id: userId,
          assigned_at: new Date().toISOString(),
          status: 'in_progress'
        })
        .eq('id', taskId)
        .eq('status', 'open')
        .select(`
          *,
          category:categories(id, name, color, code),
          location:locations(id, name, building, floor),
          assignee:users!tasks_assignee_id_fkey(id, name, email)
        `)
        .single();

      if (error) {
        console.error('❌ Claim task error:', error);
        throw error;
      }

      console.log('✅ Task claimed:', data);
      return this._mapTask(data);
    } catch (error) {
      console.error('❌ Claim task error:', error);
      throw error;
    }
  },

  // Unclaim task
  async unclaim(taskId) {
    console.log('↩️ Unclaiming task:', taskId);
    
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update({
          assignee_id: null,
          assigned_at: null,
          status: 'open'
        })
        .eq('id', taskId)
        .select(`
          *,
          category:categories(id, name, color, code),
          location:locations(id, name, building, floor)
        `)
        .single();

      if (error) {
        console.error('❌ Unclaim task error:', error);
        throw error;
      }

      console.log('✅ Task unclaimed:', data);
      return this._mapTask(data);
    } catch (error) {
      console.error('❌ Unclaim task error:', error);
      throw error;
    }
  },

  // Submit task
  async submit(taskId, submitData) {
    console.log('📨 Submitting task:', taskId, submitData);
    
    try {
      const updateData = {
        status: 'pending_approval',
        submission_status: submitData.status,
        submitted_by: submitData.userId,
        submitted_at: new Date().toISOString()
      };

      if (submitData.photo) updateData.submission_photo = submitData.photo;
      if (submitData.remarks) updateData.submission_remarks = submitData.remarks;
      if (submitData.skipReason) updateData.skip_reason = submitData.skipReason;

      const { data, error } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', taskId)
        .select(`
          *,
          category:categories(id, name, color, code),
          location:locations(id, name, building, floor),
          assignee:users!tasks_assignee_id_fkey(id, name, email),
          submitter:users!tasks_submitted_by_fkey(id, name, email)
        `)
        .single();

      if (error) {
        console.error('❌ Submit task error:', error);
        throw error;
      }

      console.log('✅ Task submitted:', data);
      return this._mapTask(data);
    } catch (error) {
      console.error('❌ Submit task error:', error);
      throw error;
    }
  },

  // Approve task
  async approve(taskId, approverId) {
    console.log('✅ Approving task:', taskId, 'by:', approverId);
    
    try {
      // Get submission status first
      const { data: task } = await supabase
        .from('tasks')
        .select('submission_status')
        .eq('id', taskId)
        .single();

      let finalStatus = 'completed';
      if (task?.submission_status === 'issue') finalStatus = 'issue';
      else if (task?.submission_status === 'skipped') finalStatus = 'skipped';

      const { data, error } = await supabase
        .from('tasks')
        .update({
          status: finalStatus,
          approved_by: approverId,
          approved_at: new Date().toISOString()
        })
        .eq('id', taskId)
        .select(`
          *,
          category:categories(id, name, color, code),
          location:locations(id, name, building, floor),
          assignee:users!tasks_assignee_id_fkey(id, name, email),
          submitter:users!tasks_submitted_by_fkey(id, name, email),
          approver:users!tasks_approved_by_fkey(id, name, email)
        `)
        .single();

      if (error) {
        console.error('❌ Approve task error:', error);
        throw error;
      }

      console.log('✅ Task approved:', data);
      return this._mapTask(data);
    } catch (error) {
      console.error('❌ Approve task error:', error);
      throw error;
    }
  },

  // Reject task
  async reject(taskId, newDueDate, reason) {
    console.log('❌ Rejecting task:', taskId);
    
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update({
          status: 'open',
          due_date: newDueDate,
          rejection_reason: reason,
          assignee_id: null,
          assigned_at: null,
          submission_status: null,
          submission_photo: null,
          submission_remarks: null,
          skip_reason: null,
          submitted_by: null,
          submitted_at: null
        })
        .eq('id', taskId)
        .select(`
          *,
          category:categories(id, name, color, code),
          location:locations(id, name, building, floor)
        `)
        .single();

      if (error) {
        console.error('❌ Reject task error:', error);
        throw error;
      }

      console.log('✅ Task rejected:', data);
      return this._mapTask(data);
    } catch (error) {
      console.error('❌ Reject task error:', error);
      throw error;
    }
  },

  // Helper to map task data
  _mapTask(task) {
    return {
      id: task.id,
      runNumber: task.run_number,
      title: task.title,
      description: task.description,
      categoryId: task.category_id,
      locationId: task.location_id,
      status: task.status,
      dueDate: task.due_date,
      assigneeId: task.assignee_id,
      assignedAt: task.assigned_at,
      submissionStatus: task.submission_status,
      submissionPhoto: task.submission_photo,
      submissionRemarks: task.submission_remarks,
      skipReason: task.skip_reason,
      submittedBy: task.submitted_by,
      submittedAt: task.submitted_at,
      approvedBy: task.approved_by,
      approvedAt: task.approved_at,
      rejectionReason: task.rejection_reason,
      createdBy: task.created_by,
      createdAt: task.created_at,
      updatedAt: task.updated_at,
      category: task.category,
      location: task.location,
      assignee: task.assignee,
      submitter: task.submitter,
      approver: task.approver,
      creator: task.creator
    };
  }
};

export default taskService;