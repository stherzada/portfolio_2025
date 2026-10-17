// Applies the theme before first paint to avoid a light flash on dark mode.
// External file (not inline) because the CSP only allows script-src 'self'.
(function () {
  var saved = null
  try { saved = localStorage.getItem('theme') } catch (e) {}
  var dark = saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches
  if (dark) document.documentElement.classList.add('dark')
})()
