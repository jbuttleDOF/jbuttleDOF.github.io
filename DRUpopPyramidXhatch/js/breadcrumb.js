    // Converts a string like "training-materials" to "Training Materials"
    function toTitleCase(str) {
      return str
        .split('-')
        .map(function (word) {
          return word.charAt(0).toUpperCase() + word.slice(1);
        })
        .join(' ');
    }

    window.onload = function () {
      var container = document.getElementById("breadcrumb-container");
      if (!container) return;

      var fullUrl = window.location.href;
      var url = new URL(fullUrl);

      // Get path parts (excluding empty segments)
      var pathParts = url.pathname.split("/").filter(Boolean);

      // Remove the last part if it's a file (e.g., index.html)
      var lastPart = pathParts[pathParts.length - 1];
      var isFile = lastPart && lastPart.includes(".");
      if (isFile) {
        pathParts.pop();
      }

      // Start breadcrumb HTML
      var breadcrumb = '<nav aria-label="Breadcrumb" class="breadcrumbs"><ol>';
      breadcrumb += '<li><a href="' + url.origin + '/">Home</a></li>';

      var fullPath = url.origin;

      for (var i = 0; i < pathParts.length; i++) {
        var segment = pathParts[i];
        var isLast = i === pathParts.length - 1;
        fullPath += '/' + segment;

        var label = toTitleCase(segment);

        if (isLast) {
          // Current folder: plain text
          breadcrumb += '<li>' + label + '</li>';
        } else {
          // Clickable links
          breadcrumb += '<li><a href="' + fullPath + '/">' + label + '</a></li>';
        }
      }

      breadcrumb += '</ol></nav>';
      container.innerHTML = breadcrumb;
    };
