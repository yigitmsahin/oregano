/* ==========================================================================
   main.js — site behaviour
   Header state · mobile nav · smooth scroll · scrollspy · reveal on scroll
   animated counters · language buttons · quote form
   ========================================================================== */

(function ($) {
  "use strict";

  var reduceMotion = window.matchMedia &&
                     window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  $(function () {

    /* ------------------------------------------------------------------
       Language: boot the dictionary, then wire the TR / EN / DE buttons.
       ------------------------------------------------------------------ */
    I18n.init();

    $(".lang-btn").on("click", function () {
      I18n.setLang($(this).data("lang"));
    });

    /* Numbers are re-rendered on switch so 3,000 becomes 3.000 in de/tr. */
    $(document).on("languagechange.i18n", function () {
      $(".stat-num").each(function () {
        var $n = $(this);
        if ($n.data("done")) { paintCount($n, +$n.data("count")); }
      });
    });

    /* ------------------------------------------------------------------
       Header: translucent bar once the page scrolls.
       ------------------------------------------------------------------ */
    var $header = $("#siteHeader");
    var $toTop  = $("#toTop");

    function onScroll() {
      var y = window.pageYOffset;
      $header.toggleClass("is-stuck", y > 24);
      $toTop.toggleClass("is-visible", y > 600);
      spy(y);
    }

    /* ------------------------------------------------------------------
       Scrollspy: highlight the nav item for the section in view.
       ------------------------------------------------------------------ */
    var $navLinks = $(".nav-list a[href^='#']");
    var targets   = [];

    function measure() {
      targets = $navLinks.map(function () {
        var el = document.querySelector(this.getAttribute("href"));
        return el ? { link: this, el: el } : null;
      }).get();
    }

    function spy(y) {
      var line = y + (parseInt($header.css("height"), 10) || 76) + 40;
      var active = null;

      for (var i = 0; i < targets.length; i++) {
        if (targets[i].el.offsetTop <= line) { active = targets[i].link; }
      }
      $navLinks.removeClass("is-active");
      if (active) { $(active).addClass("is-active"); }
    }

    measure();
    $(window).on("scroll", onScroll).on("resize", function () { measure(); onScroll(); });
    onScroll();

    /* ------------------------------------------------------------------
       Mobile navigation.
       ------------------------------------------------------------------ */
    var $nav    = $("#siteNav");
    var $toggle = $("#navToggle");

    function closeNav() {
      $nav.removeClass("is-open");
      $header.removeClass("is-open");
      $toggle.attr("aria-expanded", "false");
      $("body").removeClass("nav-open");
    }

    $toggle.on("click", function () {
      var open = $nav.toggleClass("is-open").hasClass("is-open");
      $header.toggleClass("is-open", open);
      $toggle.attr("aria-expanded", open ? "true" : "false");
      $("body").toggleClass("nav-open", open);
    });

    $nav.on("click", "a", closeNav);

    $(document).on("keydown", function (e) {
      if (e.key === "Escape" && $nav.hasClass("is-open")) { closeNav(); }
    });

    $(window).on("resize", function () {
      if (window.innerWidth > 860 && $nav.hasClass("is-open")) { closeNav(); }
    });

    /* ------------------------------------------------------------------
       Smooth scroll with a header offset (CSS scroll-padding covers modern
       browsers; this keeps focus handling and older Safari correct).
       ------------------------------------------------------------------ */
    $(document).on("click", 'a[href^="#"]:not(.skip-link)', function (e) {
      var hash = this.getAttribute("href");
      if (!hash || hash === "#") { return; }

      var $target = $(hash);
      if (!$target.length) { return; }

      e.preventDefault();
      var top = $target.offset().top - (parseInt($header.css("height"), 10) || 76) - 12;

      $("html, body").stop().animate(
        { scrollTop: Math.max(top, 0) },
        reduceMotion ? 0 : 650,
        "swing",
        function () {
          $target.attr("tabindex", "-1").focus();
        }
      );
    });

    $("#toTop").on("click", function () {
      $("html, body").stop().animate({ scrollTop: 0 }, reduceMotion ? 0 : 600);
    });

    /* ------------------------------------------------------------------
       Reveal on scroll + counters.
       ------------------------------------------------------------------ */
    var $reveals = $(".reveal");

    function paintCount($el, value) {
      var suffix = $el.data("suffix") || "";
      var locale = { tr: "tr-TR", de: "de-DE", en: "en-US" }[I18n.getLang()] || "en-US";
      $el.text(Math.round(value).toLocaleString(locale) + suffix);
    }

    function runCounter($el) {
      if ($el.data("done")) { return; }
      $el.data("done", true);

      var end = +$el.data("count") || 0;

      if (reduceMotion) { paintCount($el, end); return; }

      var start = null;
      var dur   = 1600;

      function frame(ts) {
        if (start === null) { start = ts; }
        var p = Math.min((ts - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);          // ease-out cubic
        paintCount($el, end * eased);
        if (p < 1) { window.requestAnimationFrame(frame); }
      }
      window.requestAnimationFrame(frame);
    }

    function activate(el) {
      var $el = $(el).addClass("is-visible");
      $el.find(".stat-num").addBack(".stat-num").each(function () {
        runCounter($(this));
      });
    }

    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) { return; }
          activate(entry.target);
          io.unobserve(entry.target);
        });
      }, { threshold: 0.12, rootMargin: "0px 0px -60px 0px" });

      /* Stagger cards inside a grid so they cascade rather than pop together. */
      $(".product-grid, .process-steps, .stats-grid").each(function () {
        $(this).children(".reveal").each(function (i) {
          this.style.transitionDelay = Math.min(i * 70, 420) + "ms";
        });
      });

      $reveals.each(function () { io.observe(this); });
    } else {
      /* No IntersectionObserver: show everything immediately. */
      $reveals.each(function () { activate(this); });
    }

    /* ------------------------------------------------------------------
       Quote form.
       There is no backend — the site is static — so the form composes a
       pre-filled email. To collect submissions server-side instead, sign up
       for a form relay (Formspree, Basin, Web3Forms) and replace the body of
       sendByMail() with a $.post() to their endpoint.
       ------------------------------------------------------------------ */
    var $form   = $("#quoteForm");
    var $status = $("#formStatus");

    function setError($field, messageKey) {
      $field.closest(".field").addClass("has-error")
            .find(".err").text(I18n.t(messageKey));
    }

    function clearError($field) {
      $field.closest(".field").removeClass("has-error").find(".err").text("");
    }

    $form.on("input change", "input, textarea", function () { clearError($(this)); });

    function validate() {
      var ok = true;

      var $name = $("#f-name");
      if (!$.trim($name.val())) { setError($name, "form.errRequired"); ok = false; }

      var $email = $("#f-email");
      var email  = $.trim($email.val());
      if (!email) {
        setError($email, "form.errRequired"); ok = false;
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
        setError($email, "form.errEmail"); ok = false;
      }

      var $msg = $("#f-msg");
      if ($.trim($msg.val()).length < 10) { setError($msg, "form.errMessage"); ok = false; }

      return ok;
    }

    function sendByMail(data) {
      /* Recipient comes from the contact list, so it lives in exactly one place. */
      var to = ($('[data-contact="email"]').attr("href") || "mailto:info@nilc.com.tr")
                 .replace("mailto:", "");

      var subject = I18n.t("form.mailSubject") + " — " + data.product + " — " + (data.company || data.name);

      var body =
        I18n.t("form.name")     + ": " + data.name    + "\n" +
        I18n.t("form.company")  + ": " + (data.company || "-") + "\n" +
        I18n.t("form.email")    + ": " + data.email   + "\n" +
        I18n.t("form.country")  + ": " + (data.country || "-") + "\n" +
        I18n.t("form.product")  + ": " + data.product + "\n" +
        I18n.t("form.quantity") + ": " + (data.quantity || "-") + "\n\n" +
        I18n.t("form.message")  + ":\n" + data.message + "\n";

      window.location.href = "mailto:" + to +
        "?subject=" + encodeURIComponent(subject) +
        "&body="    + encodeURIComponent(body);
    }

    $form.on("submit", function (e) {
      e.preventDefault();
      $status.removeClass("is-error").text("");

      if (!validate()) {
        $status.addClass("is-error").text(I18n.t("form.statusInvalid"));
        $form.find(".has-error").first().find("input, textarea").trigger("focus");
        return;
      }

      sendByMail({
        name:     $.trim($("#f-name").val()),
        company:  $.trim($("#f-company").val()),
        email:    $.trim($("#f-email").val()),
        country:  $.trim($("#f-country").val()),
        product:  $("#f-product option:selected").text(),
        quantity: $.trim($("#f-qty").val()),
        message:  $.trim($("#f-msg").val())
      });

      $status.text(I18n.t("form.statusSent"));
    });

    /* Year in the footer stays current without an edit. */
    $(".footer-bottom [data-i18n='footer.rights']").each(function () {
      var $el = $(this);
      var stamp = function () {
        $el.text($el.text().replace(/\b(19|20)\d{2}\b/, new Date().getFullYear()));
      };
      stamp();
      $(document).on("languagechange.i18n", stamp);
    });

  });
})(jQuery);
