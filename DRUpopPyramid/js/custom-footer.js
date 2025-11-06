document.addEventListener('DOMContentLoaded', function () {
  const footer = document.getElementById('footer');

  if (!footer) return;

  // Extract the path from the URL and check if it's the homepage
  const pathname = window.location.pathname;
  const isHomePage = pathname === '/' || pathname === '/index.html' || pathname === '';
  
  // Skip custom footer loading for the homepage
  if (isHomePage) {
    console.log('Skipping custom footer loading for the homepage');
    return;
  }

  // Check if the URL contains specific paths and load the corresponding footer
  // The regular expressions are used to match the beginning of the path only
  // Matches found after the beginning of the path will not be considered
  if (/^\/accounting\//.test(pathname)) {
    loadFooterFromFile('DOFfooter', '/includes/custom-footer-accounting.html', footer);
    console.log('Accounting footer loaded');
  } else if (/^\/budget\//.test(pathname)) {
    loadFooterFromFile('DOFfooter', '/includes/custom-footer-budget.html', footer);
    console.log('Budget footer loaded');
  } else if (/^\/forecasting\//.test(pathname)) {
    loadFooterFromFile('DOFfooter', '/includes/custom-footer-forecasting.html', footer);
    console.log('Forecasting footer loaded');
  } else if (/^\/programs\//.test(pathname)) {
    loadFooterFromFile('DOFfooter', '/includes/custom-footer-programs.html', footer);
    console.log('Programs footer loaded');
  } else if (/^\/reports\//.test(pathname)) {
    loadFooterFromFile('DOFfooter', '/includes/custom-footer-reports.html', footer);
    console.log('Reports footer loaded');
  } else { // Default case - apply default footer for any other path
    loadFooterFromFile('DOFfooter', '/includes/custom-footer-default.html', footer);
    console.log('Default footer loaded');
  }

  function insertCustomFooter(id, html, referenceNode) {
    const customDiv = document.createElement('div');
    customDiv.id = id;
    customDiv.innerHTML = html;
    referenceNode.parentNode.insertBefore(customDiv, referenceNode);
  }

  function loadFooterFromFile(id, filePath, referenceNode) {
    fetch(filePath)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to load ${filePath}: ${response.status}`);
        }
        return response.text();
      })
      .then(html => {
        insertCustomFooter(id, html, referenceNode);
      })
      .catch(error => {
        console.error(error);
        insertCustomFooter(id, '<p>Could not load footer</p>', referenceNode);
      });
  }
});