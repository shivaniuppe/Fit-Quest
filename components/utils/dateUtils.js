/**
 * Returns the date string (YYYY-MM-DD) for the start of the current week (Monday).
 * If today is Sunday (0), it subtracts 6 days to get the previous Monday.
 */
export const getCurrentWeekStart = () => {
  const now = new Date();           // Get the current date
  const day = now.getDay();         // Get the day of the week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)

  // Calculate difference from today to most recent Monday
  const diff = now.getDate() - day + (day === 0 ? -6 : 1); // If Sunday, go back 6 days

  const monday = new Date(now.setDate(diff)); // Set date to calculated Monday
  monday.setHours(0, 0, 0, 0);                // Normalize time to midnight

  return monday.toISOString().split('T')[0];  // Return as "YYYY-MM-DD"
};
