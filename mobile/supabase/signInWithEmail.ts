import { supabase } from '@/supabase/supabase-client';

// Helper to provide user-friendly error messages
function getErrorMessage(error: any): string {
  if (!error) return 'An unknown error occurred';

  const message = error.message?.toLowerCase() || '';
  
  // Specific error handling based on Supabase error messages
  if (message.includes('invalid login credentials')) {
    return 'Invalid email or password. Please check and try again.';
  }
  if (message.includes('user already exists')) {
    return 'This email is already registered. Please sign in instead.';
  }
  if (message.includes('email not confirmed')) {
    return 'Please confirm your email address first. Check your inbox for a confirmation link.';
  }
  if (message.includes('invalid email')) {
    return 'Please enter a valid email address.';
  }
  if (message.includes('password')) {
    return 'Password must be at least 8 characters long.';
  }
  if (message.includes('rate limit')) {
    return 'Too many attempts. Please try again later.';
  }
  if (message.includes('connection') || message.includes('network')) {
    return 'Network error. Please check your connection and try again.';
  }

  // Default to the original error message
  return error.message || 'Authentication failed. Please try again.';
}

export async function signUpWithEmail(email: string, password: string) {
  try {
    // Validate inputs
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      throw new Error(getErrorMessage(error));
    }

    if (!data.user) {
      throw new Error('Failed to create account. Please try again.');
    }

    return { success: true, user: data.user };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Sign up failed. Please try again.';
    throw new Error(message);
  }
}

export async function signInWithEmail(email: string, password: string) {
  try {
    // Validate inputs
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(getErrorMessage(error));
    }

    if (!data.user) {
      throw new Error('Failed to sign in. Please try again.');
    }

    if (!data.session) {
      throw new Error('Failed to create session. Please try again.');
    }

    return { success: true, user: data.user, session: data.session };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Sign in failed. Please try again.';
    throw new Error(message);
  }
}
