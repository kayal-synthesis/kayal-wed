/* ============================================================
   KAYAL SoulPath — Homepage JavaScript (index.js)
   ============================================================ */

(function () {
  'use strict';

  // Populate hero floating cards using global helpers
  window.addEventListener('DOMContentLoaded', function () {
    // Universal Day Number for hero card
    const now = new Date();
    let s = 0;
    [now.getDate(), now.getMonth() + 1, now.getFullYear()].forEach(n => {
      String(n).split('').forEach(c => s += +c);
    });
    while (s > 9) { let t = 0; String(s).split('').forEach(c => t += +c); s = t; }
    const dayNum = s || 9;

    const heroNum = document.getElementById('hero-day-num');
    const heroInsight = document.getElementById('hero-day-insight');
    const insights = {
      1:'New beginnings. Bold starts are supported.',
      2:'Patience and partnership. Listen first.',
      3:'Expression and joy. Create today.',
      4:'Discipline. Do the real work.',
      5:'Change. Stay flexible.',
      6:'Care. Be present for others.',
      7:'Stillness. The answer is within.',
      8:'Authority. Business decisions are supported.',
      9:'Completion. Release with grace.',
    };
    if (heroNum) heroNum.textContent = dayNum;
    if (heroInsight) heroInsight.textContent = insights[dayNum] || '';

    // Moon symbol for hero card
    const phases = ['🌑','🌒','🌓','🌔','🌕','🌖','🌗','🌘'];
    const phaseNames = ['New Moon','Waxing Crescent','First Quarter','Waxing Gibbous','Full Moon','Waning Gibbous','Last Quarter','Waning Crescent'];
    const idx = Math.floor(Date.now() / (3.69 * 24 * 3600 * 1000)) % 8;
    const heroMoonSym = document.getElementById('hero-moon-sym');
    const heroMoonName = document.getElementById('hero-moon-name');
    if (heroMoonSym) heroMoonSym.textContent = phases[idx];
    if (heroMoonName) heroMoonName.textContent = phaseNames[idx];
  });
})();
