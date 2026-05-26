// Display the user's chosen handle if we have it, else fall back to the
// stable numeric id. Single helper so every member/invite/ban/request row
// can render the same shape: "username" or "User #42".
export function userLabel(
  userId: number,
  username?: string | null,
  selfFallback?: string | null,
) {
  if (username && username.length > 0) return username;
  if (selfFallback) return selfFallback;
  return `User #${userId}`;
}
