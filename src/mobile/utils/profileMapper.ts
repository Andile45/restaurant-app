import type { Profile } from '../../../common/types/profile';

export const mapProfileFromDatabase = (
  profile: any,
  authId: string
): Profile => {
  return {
    id: profile.id,
    auth_id: profile.auth_uid || profile.auth_id || authId,
    name: profile.name,
    surname: profile.surname,
    contact_number: profile.contact_number,
    email: profile.email,
    address: profile.address,
    card_last4: profile.card_last4,
    role: profile.role,
    created_at: profile.created_at,
  };
};
