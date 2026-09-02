// Copy the email address to the clipboard and confirm it in the button label.
document.addEventListener('DOMContentLoaded', function () {
  var btn = document.getElementById('copy');
  var email = document.getElementById('email');
  if (!btn || !email) return;

  btn.addEventListener('click', function () {
    navigator.clipboard.writeText(email.textContent.trim()).then(
      function () {
        btn.textContent = 'copied';
        setTimeout(function () { btn.textContent = 'copy'; }, 1500);
      },
      function () {
        btn.textContent = 'press ctrl+c';
        setTimeout(function () { btn.textContent = 'copy'; }, 2500);
      }
    );
  });
});
