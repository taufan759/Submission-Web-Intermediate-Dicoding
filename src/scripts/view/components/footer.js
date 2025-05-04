class Footer {
    constructor() {
      const footerElement = document.querySelector('footer');
      
      const currentYear = new Date().getFullYear();
      const copyrightText = footerElement.querySelector('p');
      
      copyrightText.innerHTML = copyrightText.innerHTML.replace('2025', currentYear);
    }
  }
  
  const footer = new Footer();