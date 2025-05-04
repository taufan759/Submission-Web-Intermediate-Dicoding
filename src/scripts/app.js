document.addEventListener('DOMContentLoaded', () => {
  const app = new AppPresenter({
    view: new AppView(),
    model: storyModel,
    authModel: authModel,
    router: router
  });
  
  app.start();
});

// Skip to content functionality
const mainContent = document.querySelector('#mainContent');
const skipLink = document.querySelector('.skip-link');

if (mainContent && skipLink) {
  skipLink.addEventListener('click', function (event) {
    event.preventDefault(); // Prevent page refresh
    skipLink.blur();        // Remove focus
    mainContent.focus();    // Focus on main content
    mainContent.scrollIntoView(); // Scroll to main content
  });
}

// Enable view transitions if browser supports it
if (!document.startViewTransition) {
  document.documentElement.classList.add('no-view-transitions');
}