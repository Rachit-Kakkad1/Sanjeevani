/**
 * Google Analytics utility
 */
export const initGA = (measurementId) => {
  if (!measurementId) return;

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }
  gtag('js', new Date());
  gtag('config', measurementId);
  
  window.gtag = gtag;
};

export const trackPageView = (path) => {
  if (window.gtag) {
    window.gtag('event', 'page_view', {
      page_path: path,
    });
  }
};

export const trackEvent = (eventName, params = {}) => {
  if (window.gtag) {
    window.gtag('event', eventName, params);
  }
};

export const EVENTS = {
  FILE_UPLOAD_CLICKED: 'file_upload_clicked',
  FILE_SELECTED: 'file_selected',
  UPLOAD_SUCCESS: 'upload_success',
  UPLOAD_ERROR: 'upload_error',
  NAVIGATE: 'navigation_clicked'
};

