const status = document.querySelector('#copy-status');

for (const button of document.querySelectorAll('[data-copy]')) {
  button.hidden = false;
  button.addEventListener('click', async () => {
    const textarea = document.getElementById(button.dataset.copy);
    const name = textarea.id === 'html-code' ? 'index.html' : 'style.css';
    button.disabled = true;
    status.textContent = '';
    let copied = false;
    try {
      await navigator.clipboard.writeText(textarea.value);
      copied = true;
    } catch {
      // Older browsers and denied clipboard access can still use selected text.
      textarea.focus();
      textarea.select();
      try {
        copied = document.execCommand('copy');
      } catch {
        copied = false;
      }
    } finally {
      button.disabled = false;
    }
    if (copied) {
      status.textContent = `${name} copied. Paste it into your project.`;
      button.focus({ preventScroll: true });
    } else {
      status.textContent = `Select all the code in ${name} and use your browser's Copy command.`;
    }
  });
}
