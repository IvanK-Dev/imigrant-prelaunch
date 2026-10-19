const button = document.querySelector('.menu-button')
const menu = document.querySelector('.mobile-nav')

if (button && menu) {
  const close = () => {
    button.setAttribute('aria-expanded', 'false')
    menu.classList.remove('is-open')
  }
  button.addEventListener('click', () => {
    const open = button.getAttribute('aria-expanded') !== 'true'
    button.setAttribute('aria-expanded', String(open))
    menu.classList.toggle('is-open', open)
  })
  menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', close))
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') close() })
}
