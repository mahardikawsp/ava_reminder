const { getAllActiveReminders } = require('./handlers/commands');
const { getGreeting, getTodayLabel } = require('./utils/time');
const fs = require('fs');
const moment = require('moment-timezone');
const path = './user-config.json';

function saveUserConfig(data) {
  try {
    fs.writeFileSync(path, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('❌ Failed to save config:', err);
  }
}

function startScheduler(client) {
  setInterval(() => {
    // const now = new Date();
    const now = moment().tz('Asia/Jakarta');
    const currentTime = now.format('HH:mm');
    // const hours = String(now.getHours()).padStart(2, '0');
    // const minutes = String(now.getMinutes()).padStart(2, '0');
    // const currentTime = `${hours}:${minutes}`;
    const today = getTodayLabel();

    // Format tanggal DD/MM/YYYY untuk one-time reminder
    // const currentDate = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
    const currentDate = now.format('DD/MM/YYYY');
    const users = getAllActiveReminders();
    let configChanged = false;

    Object.entries(users).forEach(([user, data]) => {
      if (!data.active) return;
      const reminders = data.reminders || [];

      // Membuat array untuk menyimpan indeks reminder yang perlu dihapus
      const toRemove = [];

      reminders.forEach((reminder, index) => {
        if (reminder.oneTime) {
          // Cek reminder satu kali
          if (reminder.date === currentDate && reminder.time === currentTime) {
            const greeting = getGreeting();
            const msg = `${greeting}, tuan! [Reminder Satu Kali] ${reminder.message}`;
            client.sendMessage(user, msg);
            console.log(`✅ Reminder satu kali dikirim ke ${user} - ${reminder.date} ${reminder.time}`);

            // Tandai untuk dihapus nanti
            toRemove.push(index);
            configChanged = true;
          }
        } else {
          // Cek reminder reguler
          if (reminder.time === currentTime && reminder.days.includes(today)) {
            const greeting = getGreeting();
            const msg = `${greeting}! ${reminder.message}`;
            client.sendMessage(user, msg);
            console.log(`✅ Reminder dikirim ke ${user} - ${reminder.time}`);
          }
        }
      });

      // Hapus reminder satu kali yang sudah dieksekusi (dari belakang agar tidak mempengaruhi indeks)
      if (toRemove.length > 0) {
        for (let i = toRemove.length - 1; i >= 0; i--) {
          users[user].reminders.splice(toRemove[i], 1);
        }
      }
    });

    // Simpan konfigurasi jika ada perubahan
    if (configChanged) {
      saveUserConfig(users);
    }
  }, 60 * 1000); // cek tiap 1 menit
}

function startSchedulerEvery3Hours(client) {
  // Run every 3 hours (3 * 60 * 60 * 1000 = 10,800,000 milliseconds)
  const THREE_HOURS = 1 * 60 * 60 * 1000;

  setInterval(() => {
    // const now = new Date();
    const now = moment().tz('Asia/Jakarta');
    const currentTime = now.format('HH:mm');
    // const hours = String(now.getHours()).padStart(2, '0');
    // const minutes = String(now.getMinutes()).padStart(2, '0');
    // const currentTime = `${hours}:${minutes}`;
    const today = getTodayLabel();

    console.log(`🕐 [3-Hour Scheduler] Running at ${currentTime} - ${today}`);

    const users = getAllActiveReminders();
    console.log(users, 'users')
    console.log(Object.entries(users), 'entries')
    Object.entries(users).forEach(([user, data]) => {
      if (!data.active || !data.every_3hour) return;

      const greeting = getGreeting();
      const msg = `${greeting}, sayang! Ini adalah pesan rutin dari bubuy, amma pasti bisa pasti bisa yaa semangat buat adek dan bubuy!`;
      client.sendMessage(user, msg);
      console.log(`✅ [3-Hour] Periodic message sent to ${user} at ${currentTime}`);
    });

  }, THREE_HOURS);
}
// Update the module exports to include the new function
// module.exports = startScheduler;
// module.exports.startScheduler = startScheduler;

// Untuk kompatibilitas dengan index.js yang mungkin menggunakan salah satu nama fungsi
module.exports = startScheduler;
module.exports.startScheduler = startScheduler;
module.exports.startSchedulerEvery3Hours = startSchedulerEvery3Hours;
