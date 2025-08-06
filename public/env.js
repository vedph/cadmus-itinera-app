// https://www.jvandemo.com/how-to-use-environment-variables-to-configure-your-angular-application-without-a-rebuild/
(function (window) {
  window.__env = window.__env || {};

  // environment-dependent settings
  window.__env.apiUrl = "http://localhost:5052/api/";
  window.__env.biblioApiUrl = "http://localhost:5000/api/";
  window.__env.version = "13.0.2";
  // enable thesaurus import in thesaurus list for admins
  window.__env.thesImportEnabled = true;
    // MUFI
  window.__env.mufiUrl = "http://localhost:5052/api/";
})(this);
