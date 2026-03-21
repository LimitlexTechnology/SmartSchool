import { supabase } from './supabaseClient';

/**
 * Fetches the current active academic term context.
 * Useful for filtering dashboards and lists automatically.
 * 
 * @returns {Promise<{id: string, year: string, term_name: string} | null>}
 */
export const fetchCurrentTermContext = async () => {
  try {
    const { data, error } = await supabase
      .from('terms')
      .select('id, year, term_name, start_date, end_date')
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('Error fetching current term context:', error.message);
      return null;
    }

    // Cache the term context in localStorage for quick access
    if (data) {
      localStorage.setItem('active_term_id', data.id);
      localStorage.setItem('active_term_name', `${data.year} ${data.term_name}`);
    }

    return data;
  } catch (err) {
    console.error('Unexpected error fetching term context:', err);
    return null;
  }
};

/**
 * Sets the active term (Admin only).
 * Calls the database function defined in the migration.
 * 
 * @param {string} termId - The UUID of the term to set as active.
 */
export const setActiveTerm = async (termId) => {
  const { error } = await supabase.rpc('set_active_term', {
    target_term_id: termId
  });

  if (error) {
    throw new Error(`Failed to set active term: ${error.message}`);
  }

  // Refresh context
  await fetchCurrentTermContext();
};
