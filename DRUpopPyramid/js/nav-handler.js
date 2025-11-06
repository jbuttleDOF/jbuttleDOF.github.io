// This JavaScript file is responsible for handling navigation link highlighting based on the current page.
// It adds the 'active' class to the navigation link that corresponds to the current page.

document.addEventListener("DOMContentLoaded", function () {
    
  // Get the current page 
  // window.CURRENT_PAGE is set at the bottom of head in the HTML file (see index.html for example)
  // If not set, there will not be an active nav link
  const currentPage = window.CURRENT_PAGE;

  // Get all navigation links
  const navLinks = document.querySelectorAll(
    ".top-level-nav .first-level-link"
  );

  // Remove any existing active states and set new active state
  navLinks.forEach((link) => {
    // Get the nav identifier attribute
    const navId = link.getAttribute("data-nav-id");

    if (navId === currentPage) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });
});
