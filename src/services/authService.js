import supabase from '../lib/supabase';

export const authService = {
  // ==================== EMAIL/PASSWORD LOGIN ====================
  async login(email, password) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      throw new Error('Invalid credentials');
    }

    if (!data) {
      throw new Error('User not found');
    }

    if (!data.is_active) {
      throw new Error('Account is inactive. Please contact administrator.');
    }

    // Update last login
    await supabase
      .from('users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', data.id);

    return data;
  },

  // ==================== SESSION VALIDATION ====================
  async validateSession(userId) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .eq('is_active', true)
      .single();

    if (error || !data) {
      return null;
    }

    return data;
  },

  // ==================== GOOGLE SSO ====================
  
  // Initiate Google OAuth login
  async signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/login`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) {
      throw new Error('Failed to initiate Google login: ' + error.message);
    }

    return data;
  },

  // Get current Supabase auth session
  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      throw new Error('Failed to get session: ' + error.message);
    }
    
    return session;
  },

  // Handle Google OAuth callback
  async handleGoogleCallback() {
    // Get the current Supabase auth session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      throw new Error('No active session found');
    }

    const googleUser = session.user;
    const googleId = googleUser.id;
    const email = googleUser.email;
    const name = googleUser.user_metadata?.full_name || googleUser.user_metadata?.name || email.split('@')[0];
    const avatarUrl = googleUser.user_metadata?.avatar_url || googleUser.user_metadata?.picture || null;

    // Check if user exists by google_id
    let { data: existingUser, error: findError } = await supabase
      .from('users')
      .select('*')
      .eq('google_id', googleId)
      .single();

    // If not found by google_id, try to find by email
    if (!existingUser) {
      const { data: userByEmail } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (userByEmail) {
        // User exists with this email, link Google account
        const { data: updatedUser, error: updateError } = await supabase
          .from('users')
          .update({ 
            google_id: googleId,
            auth_provider: 'google',
            avatar_url: avatarUrl || userByEmail.avatar_url,
            last_login_at: new Date().toISOString()
          })
          .eq('id', userByEmail.id)
          .select()
          .single();

        if (updateError) {
          throw new Error('Failed to link Google account: ' + updateError.message);
        }

        existingUser = updatedUser;
      }
    }

    // If user exists, check if active
    if (existingUser) {
      if (!existingUser.is_active) {
        await supabase.auth.signOut();
        throw new Error('PENDING_APPROVAL');
      }

      // User is active - update last login
      await supabase
        .from('users')
        .update({ last_login_at: new Date().toISOString() })
        .eq('id', existingUser.id);

      return existingUser;
    }

    // User doesn't exist - create new user with is_active = false
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert({
        email: email,
        name: name,
        google_id: googleId,
        auth_provider: 'google',
        avatar_url: avatarUrl,
        role: 'technician',
        is_active: false,
        password_hash: 'GOOGLE_SSO',
      })
      .select()
      .single();

    if (createError) {
      await supabase.auth.signOut();
      throw new Error('Failed to create user: ' + createError.message);
    }

    // Sign out new user - needs approval
    await supabase.auth.signOut();
    throw new Error('PENDING_APPROVAL_NEW');
  },

  // Sign out from Supabase auth
  async signOutGoogle() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
    }
  },

  // Listen to auth state changes
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback);
  }
};

export default authService;