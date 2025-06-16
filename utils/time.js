function getCurrentTimeInUTC7() {
  const now = new Date();
  // Get current time in UTC+7
  return new Date(now.getTime() + (7 * 60 * 60 * 1000));
}

function getGreeting() {
  const hour = getCurrentTimeInUTC7().getHours();
  if (hour >= 4 && hour < 10) return "Selamat pagi";
  if (hour >= 10 && hour < 15) return "Selamat siang";
  if (hour >= 15 && hour < 18) return "Selamat sore";
  return "Selamat malam";
}

function getTodayLabel() {
  return new Intl.DateTimeFormat('id-ID', { weekday: 'long' }).format(getCurrentTimeInUTC7());
}

module.exports = { getGreeting, getTodayLabel };
