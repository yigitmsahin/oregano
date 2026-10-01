/* ==========================================================================
   i18n.js — tiny translation engine
   --------------------------------------------------------------------------
   Reads plain-text key/value files from /lang/<code>.txt and swaps the text
   of any element carrying a data-i18n* attribute. No build step, no database.

   Markup hooks:
     data-i18n="key"              -> element text
     data-i18n-html="key"         -> element HTML (values may contain tags)
     data-i18n-placeholder="key"  -> placeholder attribute
     data-i18n-alt="key"          -> alt attribute (images)
     data-i18n-content="key"      -> content attribute (used on <meta>)

   From other scripts:
     I18n.t("form.errRequired")   -> translated string
     I18n.setLang("de")           -> switch language
     I18n.getLang()               -> current code
     $(document).on("languagechange.i18n", fn)
   ========================================================================== */

window.I18n = (function ($) {
  "use strict";

  var SUPPORTED = ["tr", "en", "de"];
  var FALLBACK  = "en";
  var RTL       = [];               // add "ar", "he" here if those are ever added
  var STORE_KEY = "oregano.lang";
  var PATH      = "lang/";

  var LOCALES   = { tr: "tr_TR", en: "en_US", de: "de_DE" };   // for og:locale

  /* The site's home URL, taken from the canonical tag written in index.html. */
  var SITE_URL = (document.querySelector('link[rel="canonical"]') || {}).href || "";

  var cache   = {};                 // code -> { key: value }
  var current = null;

  /* ---------------------------------------------------------------- parse */
  /* Turns "key = value" lines into an object.
     - lines starting with # or ; are comments
     - blank lines are skipped
     - only the FIRST "=" splits, so values may contain "="
     - "\n" inside a value becomes a real line break                       */
  function parse(text) {
    var dict = {};
    if (!text) { return dict; }

    var lines = text.replace(/^﻿/, "").split(/\r\n|\r|\n/);

    for (var i = 0; i < lines.length; i++) {
      var line = lines[i].trim();
      if (!line || line.charAt(0) === "#" || line.charAt(0) === ";") { continue; }

      var eq = line.indexOf("=");
      if (eq === -1) { continue; }

      var key = line.slice(0, eq).trim();
      var val = line.slice(eq + 1).trim();
      if (!key) { continue; }

      dict[key] = val.replace(/\\n/g, "\n");
    }
    return dict;
  }

  /* ---------------------------------------------------------------- load */
  function load(code) {
    if (cache[code]) {
      return $.Deferred().resolve(cache[code]).promise();
    }
    return $.ajax({
      url: PATH + code + ".txt",
      dataType: "text",
      cache: true,
      beforeSend: function (xhr) {
        /* Force UTF-8 so Turkish (ş ğ ı) and German (ä ö ü ß) survive hosts
           that serve .txt without a charset. */
        if (xhr.overrideMimeType) { xhr.overrideMimeType("text/plain; charset=utf-8"); }
      }
    }).then(function (text) {
      cache[code] = parse(text);
      return cache[code];
    });
  }

  /* ---------------------------------------------------------------- apply */
  function t(key, fallbackText) {
    var dict = cache[current] || {};
    if (Object.prototype.hasOwnProperty.call(dict, key)) { return dict[key]; }

    var base = cache[FALLBACK] || {};
    if (Object.prototype.hasOwnProperty.call(base, key)) { return base[key]; }

    return fallbackText !== undefined ? fallbackText : key;
  }

  function apply(code) {
    var dict = cache[code] || {};

    $("[data-i18n]").each(function () {
      var key = this.getAttribute("data-i18n");
      if (dict[key] !== undefined) { $(this).text(dict[key]); }
    });

    $("[data-i18n-html]").each(function () {
      var key = this.getAttribute("data-i18n-html");
      if (dict[key] !== undefined) { $(this).html(dict[key]); }
    });

    $("[data-i18n-placeholder]").each(function () {
      var key = this.getAttribute("data-i18n-placeholder");
      if (dict[key] !== undefined) { this.setAttribute("placeholder", dict[key]); }
    });

    $("[data-i18n-alt]").each(function () {
      var key = this.getAttribute("data-i18n-alt");
      if (dict[key] !== undefined) { this.setAttribute("alt", dict[key]); }
    });

    $("[data-i18n-content]").each(function () {
      var key = this.getAttribute("data-i18n-content");
      if (dict[key] !== undefined) { this.setAttribute("content", dict[key]); }
    });

    /* Document-level bits that have no element of their own. */
    if (dict["meta.title"]) { document.title = dict["meta.title"]; }

    /* Each language is its own page for search engines: English lives at the
       bare URL, the others at ?lang=xx — matching the hreflang links and the
       sitemap. Without this every version would declare itself a duplicate
       of the English page and the translations would never be indexed. */
    if (SITE_URL) {
      var url = code === FALLBACK ? SITE_URL : SITE_URL + "?lang=" + code;
      $('link[rel="canonical"]').attr("href", url);
      $('meta[property="og:url"]').attr("content", url);
    }
    $('meta[property="og:locale"]').attr("content", LOCALES[code] || LOCALES[FALLBACK]);

    document.documentElement.setAttribute("lang", code);
    document.documentElement.setAttribute("dir", $.inArray(code, RTL) !== -1 ? "rtl" : "ltr");

    $(".lang-btn").each(function () {
      var isActive = this.getAttribute("data-lang") === code;
      $(this).toggleClass("is-active", isActive).attr("aria-pressed", isActive);
    });
  }

  /* ---------------------------------------------------------------- detect */
  function normalise(code) {
    if (!code) { return null; }
    code = String(code).toLowerCase().split("-")[0];
    return $.inArray(code, SUPPORTED) !== -1 ? code : null;
  }

  function detect() {
    /* Priority: ?lang= in the URL, then a previous choice, then the browser. */
    var fromUrl = normalise((/[?&]lang=([^&#]+)/.exec(window.location.search) || [])[1]);
    if (fromUrl) { return fromUrl; }

    var stored = null;
    try { stored = normalise(window.localStorage.getItem(STORE_KEY)); } catch (e) { /* private mode */ }
    if (stored) { return stored; }

    var langs = navigator.languages || [navigator.language || navigator.userLanguage];
    for (var i = 0; i < langs.length; i++) {
      var hit = normalise(langs[i]);
      if (hit) { return hit; }
    }
    return FALLBACK;
  }

  /* ---------------------------------------------------------------- public */
  function setLang(code, opts) {
    code = normalise(code) || FALLBACK;
    if (code === current) { return $.Deferred().resolve().promise(); }

    opts = opts || {};
    var $body = $("body");
    if (!opts.silent) { $body.addClass("lang-fading"); }

    return load(code)
      .done(function () {
        current = code;
        apply(code);

        try { window.localStorage.setItem(STORE_KEY, code); } catch (e) { /* ignore */ }

        $(document).trigger("languagechange.i18n", [code]);
      })
      .fail(function () {
        /* Most common cause: opening index.html straight from the file system.
           Browsers block reading lang/*.txt over file:// — run a local server. */
        window.console && console.warn(
          "[i18n] Could not load " + PATH + code + ".txt. " +
          "If you opened this page with file://, serve it over HTTP instead " +
          "(e.g. `python -m http.server`). The English text baked into index.html is being shown."
        );
      })
      .always(function () {
        window.setTimeout(function () { $body.removeClass("lang-fading"); }, 120);
      });
  }

  function init() {
    var code = detect();

    /* Preload the fallback too, so a missing key in one file degrades to English. */
    if (code !== FALLBACK) { load(FALLBACK); }

    return setLang(code, { silent: true });
  }

  return {
    init: init,
    setLang: setLang,
    getLang: function () { return current || FALLBACK; },
    supported: function () { return SUPPORTED.slice(); },
    t: t
  };
})(jQuery);
