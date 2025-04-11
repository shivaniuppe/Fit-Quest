export const getCurrentWeekStart = () => {
    const now = new Date();
    const day = now.getDay(); // 0 (Sun) - 6 (Sat)
    const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
    const monday = new Date(now.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday.toISOString().split('T')[0]; // Format: YYYY-MM-DD
  };
  