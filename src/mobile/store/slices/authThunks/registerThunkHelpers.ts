import { supabase } from '../../../api/supabaseClient';

export const waitForProfile = async (userId: string, maxRetries: number = 3): Promise<any> => {
  for (let i = 0; i < maxRetries; i++) {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const { data: profileData, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('auth_uid', userId)
      .single();

    if (profileData) {
      console.log('Profile found (created by trigger):', profileData.id);
      return profileData;
    }

    if (i < maxRetries - 1) {
      console.log(`Profile not found yet, retrying... (${maxRetries - i - 1} attempts left)`);
    }
  }
  return null;
};

export const createProfileViaFunction = async (
  userId: string,
  email: string,
  name: string,
  surname: string,
  contactNumber?: string
): Promise<any> => {
  const { error: functionError } = await supabase.rpc('create_user_profile', {
    p_auth_uid: userId,
    p_email: email,
    p_name: name,
    p_surname: surname,
    p_contact_number: contactNumber || null,
  });

  if (functionError) {
    console.error('Database function also failed:', functionError);
    throw functionError;
  }

  const { data: fetchedProfile, error: fetchError } = await supabase
    .from('profiles')
    .select('*')
    .eq('auth_uid', userId)
    .single();

  if (fetchError) {
    console.log('Profile created by function but cannot fetch (no session - email confirmation required)');
    return null;
  }

  console.log('Profile created via database function:', fetchedProfile.id);
  return fetchedProfile;
};

export const createProfileViaDirectInsert = async (
  userId: string,
  email: string,
  name: string,
  surname: string,
  contactNumber?: string
): Promise<any> => {
  const { data: directProfile, error: directError } = await supabase
    .from('profiles')
    .insert({
      auth_uid: userId,
      email,
      name,
      surname,
      contact_number: contactNumber || null,
      role: 'user',
    })
    .select()
    .single();

  if (directError) {
    throw directError;
  }

  console.log('Profile created via direct insert:', directProfile.id);
  return directProfile;
};
