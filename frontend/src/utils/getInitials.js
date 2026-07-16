// Shared avatar-initials fallback, used wherever a doctor's photoUrl isn't
// set yet — Find a Doctor cards and the admin doctors table/form.
export const getInitials = (first, last) =>
  `${first?.[0] ?? ""}${last?.[0] ?? ""}`.toUpperCase();// Shared avatar-initials fallback, used wherever a doctor's photoUrl isn't
