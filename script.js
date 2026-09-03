document.addEventListener('DOMContentLoaded', function () {

  /* ---------- theme toggle ---------- */

  var root = document.documentElement;
  var themeBtn = document.getElementById('theme');

  function currentTheme() {
    var set = root.getAttribute('data-theme');
    if (set) return set;
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }

  // The button names the theme you'd switch TO, not the one you're in.
  function labelButton() {
    if (themeBtn) {
      themeBtn.textContent = currentTheme() === 'dark' ? 'light' : 'dark';
    }
  }

  labelButton();

  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      var next = currentTheme() === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) {}
      labelButton();
    });
  }

  // Follow the system if the visitor has never picked manually.
  window.matchMedia('(prefers-color-scheme: dark)')
    .addEventListener('change', function () {
      var saved = null;
      try { saved = localStorage.getItem('theme'); } catch (e) {}
      if (!saved) labelButton();
    });

  /* ---------- copy email ---------- */

  var copyBtn = document.getElementById('copy');
  var email = document.getElementById('email');

  if (copyBtn && email) {
    copyBtn.addEventListener('click', function () {
      navigator.clipboard.writeText(email.textContent.trim()).then(
        function () {
          copyBtn.textContent = 'copied';
          setTimeout(function () { copyBtn.textContent = 'copy'; }, 1500);
        },
        function () {
          copyBtn.textContent = 'press ctrl+c';
          setTimeout(function () { copyBtn.textContent = 'copy'; }, 2500);
        }
      );
    });
  }

});
