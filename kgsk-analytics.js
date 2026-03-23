/* ==========================================================================
   KGSK Analytics — Lightweight event tracking
   Wires to GTM dataLayer and GA4 gtag when present.
   Falls back to console.debug on localhost.
   No external dependencies. ES5-compatible.
   ========================================================================== */

window.KGSK_ANALYTICS = (function() {

  var TOOL = 'kgsk-lead-funnel';
  var _session = {
    started: false,
    lang: null,
    steps_completed: [],
    result_viewed: false,
    lead_submitted: false
  };

  function _fire(name, data) {
    var payload = {};
    payload.tool        = TOOL;
    payload.ts          = Date.now();
    payload.page_url    = window.location.href;
    if (data) {
      for (var k in data) {
        if (Object.prototype.hasOwnProperty.call(data, k)) payload[k] = data[k];
      }
    }

    /* GTM dataLayer */
    if (window.dataLayer && typeof window.dataLayer.push === 'function') {
      window.dataLayer.push({ event: 'kgsk_' + name, kgsk: payload });
    }

    /* GA4 gtag */
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'kgsk_' + name, payload);
    }

    /* Localhost debug */
    var h = window.location.hostname;
    if (h === 'localhost' || h === '127.0.0.1' || h === '') {
      console.debug('[KGSK Analytics] ' + name, payload);
    }
  }

  /* Step name map */
  var STEP_NAMES = {
    0: 'rolle',
    1: 'projekt',
    2: 'gebaeude',
    3: 'details',
    4: 'kontakt'
  };

  return {

    /* Page / tool load */
    toolStart: function(lang) {
      if (_session.started) return;
      _session.started = true;
      _session.lang    = lang;
      _fire('tool_start', { lang: lang });
    },

    /* FMC funnel step completed */
    stepComplete: function(stepIndex) {
      var stepName = STEP_NAMES[stepIndex] || ('step_' + stepIndex);
      if (_session.steps_completed.indexOf(stepIndex) === -1) {
        _session.steps_completed.push(stepIndex);
      }
      _fire('step_complete', {
        step:      stepIndex,
        step_name: stepName,
        lang:      _session.lang
      });
    },

    /* FMC results displayed after lead submit */
    resultView: function(matchCount, tier, potentialRange) {
      _session.result_viewed = true;
      _fire('result_view', {
        match_count:     matchCount,
        tier:            tier || 'unknown',
        potential_range: potentialRange || '',
        lang:            _session.lang
      });
    },

    /* Language toggle clicked */
    langSwitch: function(fromLang, toLang) {
      _session.lang = toLang;
      _fire('lang_switch', { from: fromLang, to: toLang });
    },

    /* Official source link clicked on a programme card */
    sourceClick: function(programmeId, url) {
      _fire('source_click', {
        programme_id: programmeId,
        url:          url,
        lang:         _session.lang
      });
    },

    /* Any CTA button clicked */
    ctaClick: function(ctaType, destination) {
      _fire('cta_click', {
        cta_type:    ctaType,
        destination: destination,
        lang:        _session.lang
      });
    },

    /* Lead form submitted */
    leadSubmit: function(tier, matchCount, interest) {
      _session.lead_submitted = true;
      _fire('lead_submit', {
        tier:        tier || 'unknown',
        match_count: matchCount,
        interest:    interest || '',
        lang:        _session.lang
      });
    },

    /* ROI result calculated / viewed */
    roiResultView: function(type, area, paybackYears) {
      _fire('roi_result_view', {
        greening_type: type,
        area_m2:       area,
        payback_years: paybackYears,
        lang:          _session.lang
      });
    },

    /* Enquiry form passed validation — prepared to send */
    enquiryPrepared: function(serviceId) {
      _fire('enquiry_prepared', { service_id: serviceId || '', lang: _session.lang });
    },

    /* POST to endpoint initiated */
    directSendAttempt: function(context) {
      _fire('direct_send_attempt', { context: context || '', lang: _session.lang });
    },

    /* POST succeeded (HTTP 2xx) */
    directSendSuccess: function(context) {
      _fire('direct_send_success', { context: context || '', lang: _session.lang });
    },

    /* POST failed (network error or non-2xx) */
    directSendFailure: function(context, reason) {
      _fire('direct_send_failure', { context: context || '', reason: reason || '', lang: _session.lang });
    },

    /* User copied enquiry/lead summary to clipboard */
    summaryCopy: function(context) {
      _fire('summary_copy', { context: context || '', lang: _session.lang });
    },

    /* User clicked the official contact / mailto fallback link */
    officialContactClick: function(context) {
      _fire('official_contact_click', { context: context || '', lang: _session.lang });
    }

  };

})();
