// https://www.jvandemo.com/how-to-use-environment-variables-to-configure-your-angular-application-without-a-rebuild/
(function (window) {
  window.__env = window.__env || {};

  // environment-dependent settings
  window.__env.apiUrl = 'http://localhost:5052/api/';
  window.__env.biblioApiUrl = 'http://localhost:61691/api/';
  window.__env.version = '3.0.10';
})(this);
