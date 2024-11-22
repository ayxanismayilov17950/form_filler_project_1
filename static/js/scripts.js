const header = document.querySelector(".header");
const navbarLogo = document.querySelector(".navbar__logo");
// navbar.offsetTop won't work when the user reloads the page when navbar is sticked
const navPos = header.offsetHeight;

window.onscroll = () => {
  navbarLogo.classList.toggle("navbar__logo--visible", navPos < window.scrollY);
};
