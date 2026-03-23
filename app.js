/* ==========================================================================
   KGSK Lead Funnel Tool — app.js
   Depends on: window.I18N, window.FUNDING_DATA, window.KGSK_SCORING
   All logic exposed via window.KGSK_APP
   ========================================================================== */

/* --------------------------------------------------------------------------
   CONFIG — set before deploying
   -------------------------------------------------------------------------- */

/* Set to your form/CRM endpoint URL to enable live lead submission.
   Leave empty for demo mode (results still shown; no payload sent).
   Example: 'https://formspree.io/f/xyzabcd'
   Submissions route to: office@kgsk.de */
var KGSK_LEAD_ENDPOINT = 'https://formspree.io/f/xqeyrqjd';

/* --------------------------------------------------------------------------
   SECTION 1: Language System
   -------------------------------------------------------------------------- */

var currentLang = localStorage.getItem('kgsk_lang') || 'de';

function t(key) {
  var dict = window.I18N[currentLang];
  return (dict && dict[key]) ? dict[key] : (window.I18N['de'][key] || key);
}

function setLang(lang) {
  var prevLang = currentLang;
  currentLang = lang;
  localStorage.setItem('kgsk_lang', lang);
  document.documentElement.lang = lang;
  if (window.KGSK_ANALYTICS) { KGSK_ANALYTICS.langSwitch(prevLang, lang); }
  renderAll();
}

function updateLangButtons() {
  var btns = document.querySelectorAll('.lang-btn');
  for (var i = 0; i < btns.length; i++) {
    if (btns[i].getAttribute('data-lang') === currentLang) {
      btns[i].className = btns[i].className.replace(/\bactive\b/g, '').trim() + ' active';
    } else {
      btns[i].className = btns[i].className.replace(/\bactive\b/g, '').trim();
    }
  }
}

/* --------------------------------------------------------------------------
   SECTION 2: Tab System
   -------------------------------------------------------------------------- */

var currentTab = 'fordermittelcheck';

function switchTab(id) {
  currentTab = id;

  var tabBtns = document.querySelectorAll('.tab-btn');
  for (var i = 0; i < tabBtns.length; i++) {
    if (tabBtns[i].getAttribute('data-tab') === id) {
      tabBtns[i].className = tabBtns[i].className.replace(/\bactive\b/g, '').trim() + ' active';
    } else {
      tabBtns[i].className = tabBtns[i].className.replace(/\bactive\b/g, '').trim();
    }
  }

  var panels = document.querySelectorAll('.tool-panel');
  for (var j = 0; j < panels.length; j++) {
    if (panels[j].getAttribute('data-panel') === id) {
      panels[j].style.display = 'block';
    } else {
      panels[j].style.display = 'none';
    }
  }

  if (id === 'roi') {
    calcROI();
  }
}

/* --------------------------------------------------------------------------
   SECTION 3: FMC State
   -------------------------------------------------------------------------- */

var fmcState = {
  step: 0,
  actor: null,
  project: null,
  building: null,
  land: 'nrw',
  size: null,
  timeline: null,
  budget: null
};

var leadData = {
  name: '',
  email: '',
  phone: '',
  org: '',
  interest: '',
  consent: false
};

var fmcSubmitted = false;
var matchedProgrammes = [];
var lastPayload = null;

/* --------------------------------------------------------------------------
   SECTION 4: FMC Step Rendering
   -------------------------------------------------------------------------- */

function renderFMC() {
  renderProgress();
  renderStepContent();
  updateNavButtons();
}

function renderProgress() {
  var progressLine = document.getElementById('fmc-progress-line');
  if (progressLine) {
    progressLine.style.width = (fmcState.step / 4) * 100 + '%';
  }

  var dots = document.querySelectorAll('.step-dot');
  for (var i = 0; i < dots.length; i++) {
    dots[i].className = dots[i].className
      .replace(/\bdone\b/g, '')
      .replace(/\bactive\b/g, '')
      .trim();

    if (i < fmcState.step) {
      dots[i].className += ' done';
    } else if (i === fmcState.step) {
      dots[i].className += ' active';
    }
  }

  var stepLabels = document.querySelectorAll('.step-label');
  var labelKeys = ['step_label_1', 'step_label_2', 'step_label_3', 'step_label_4', 'step_label_5'];
  for (var j = 0; j < stepLabels.length; j++) {
    if (labelKeys[j]) {
      stepLabels[j].textContent = t(labelKeys[j]);
    }
  }
}

function renderStepContent() {
  var steps = document.querySelectorAll('.fmc-step');
  for (var i = 0; i < steps.length; i++) {
    var stepIndex = parseInt(steps[i].getAttribute('data-step'), 10);
    if (stepIndex === fmcState.step) {
      steps[i].className = steps[i].className.replace(/\bactive\b/g, '').trim() + ' active';
    } else {
      steps[i].className = steps[i].className.replace(/\bactive\b/g, '').trim();
    }
  }

  if (fmcState.step === 3) {
    renderDetailsStep();
  }
  if (fmcState.step === 4) {
    renderLeadStep();
  }

  markSelectedOptions();
  updateNextBtn();
}

function markSelectedOptions() {
  var cards = document.querySelectorAll('.option-card');
  for (var i = 0; i < cards.length; i++) {
    var key = cards[i].getAttribute('data-key');
    var val = cards[i].getAttribute('data-val');
    if (key && fmcState[key] === val) {
      cards[i].className = cards[i].className.replace(/\bselected\b/g, '').trim() + ' selected';
    } else {
      cards[i].className = cards[i].className.replace(/\bselected\b/g, '').trim();
    }
  }
}

function selectOption(key, val) {
  fmcState[key] = val;
  markSelectedOptions();
  updateNextBtn();
}

function updateNextBtn() {
  var nextBtn = document.getElementById('fmc-next');
  if (!nextBtn) return;

  var enabled = false;
  switch (fmcState.step) {
    case 0: enabled = fmcState.actor !== null; break;
    case 1: enabled = fmcState.project !== null; break;
    case 2: enabled = fmcState.building !== null; break;
    case 3: enabled = !!(fmcState.land && fmcState.size); break;
    case 4: enabled = !!(leadData.name && leadData.email && leadData.consent); break;
    default: enabled = true;
  }

  nextBtn.disabled = !enabled;
}

function updateNavButtons() {
  var backBtn = document.getElementById('fmc-back');
  var nextBtn = document.getElementById('fmc-next');

  if (backBtn) {
    backBtn.disabled = fmcState.step === 0;
  }

  if (nextBtn) {
    var btnLabel = fmcState.step === 4 ? t('btn_submit') : t('btn_next');
    var nextSpan = nextBtn.querySelector('[data-i18n]');
    if (nextSpan) {
      nextSpan.textContent = btnLabel;
    } else {
      nextBtn.textContent = btnLabel;
    }
  }

  updateNextBtn();
}

/* --------------------------------------------------------------------------
   SECTION 5: FMC Navigation
   -------------------------------------------------------------------------- */

function fmcNext() {
  if (fmcState.step < 4) {
    if (window.KGSK_ANALYTICS) { KGSK_ANALYTICS.stepComplete(fmcState.step); }
    fmcState.step++;
    renderFMC();
  } else {
    submitLead();
  }
}

function fmcBack() {
  if (fmcState.step > 0) {
    fmcState.step--;
    renderFMC();
  }
}

function fmcRestart() {
  fmcState = {
    step: 0,
    actor: null,
    project: null,
    building: null,
    land: 'nrw',
    size: null,
    timeline: null,
    budget: null
  };
  leadData = {
    name: '',
    email: '',
    phone: '',
    org: '',
    interest: '',
    consent: false
  };
  fmcSubmitted = false;
  matchedProgrammes = [];
  lastPayload = null;
  renderFMC();
  showResultsSection(false);
}

/* --------------------------------------------------------------------------
   SECTION 6: Lead Submission
   -------------------------------------------------------------------------- */

function submitLead() {
  if (!leadData.name || !leadData.email || !leadData.consent) {
    var msgEl = document.getElementById('lead-validation-msg');
    if (msgEl) {
      msgEl.textContent = t('lead_validation_error');
      msgEl.className = msgEl.className.replace(/\bhidden\b/g, '').trim();
    }
    return;
  }

  matchedProgrammes = window.FUNDING_DATA.match(fmcState);

  var payload = window.KGSK_SCORING.buildPayload(fmcState, leadData, matchedProgrammes, currentLang);
  payload.results.potential_range = window.FUNDING_DATA.potentialRange(matchedProgrammes, fmcState.size);

  /* Stamp source identifiers */
  if (!payload.meta) { payload.meta = {}; }
  payload.meta.source_type = 'fmc_lead';
  payload.meta.page_url    = window.location.href;

  lastPayload = payload;

  if (window.KGSK_ANALYTICS) {
    KGSK_ANALYTICS.stepComplete(4);
    KGSK_ANALYTICS.leadSubmit(
      payload.scoring ? payload.scoring.tier : 'unknown',
      matchedProgrammes.length,
      leadData.interest
    );
    KGSK_ANALYTICS.resultView(
      matchedProgrammes.length,
      payload.scoring ? payload.scoring.tier : 'unknown',
      payload.results ? payload.results.potential_range : ''
    );
  }

  fmcSubmitted = true;
  showResultsSection(true);
  renderResults(matchedProgrammes, payload);

  var resultsEl = document.getElementById('fmc-results');
  if (resultsEl) {
    resultsEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /* Async CRM / form POST — does not block results display */
  postLeadPayload(payload);
}

/* --------------------------------------------------------------------------
   SECTION 6b: Lead POST + Fallback
   -------------------------------------------------------------------------- */

function postLeadPayload(payload) {
  var statusEl = document.getElementById('fmc-send-status');

  if (!KGSK_LEAD_ENDPOINT) {
    if (statusEl) {
      statusEl.className = 'fmc-send-status not-configured';
      statusEl.innerHTML = buildSendStatusHTML('not-configured', payload);
    }
    return;
  }

  if (window.KGSK_ANALYTICS) { KGSK_ANALYTICS.directSendAttempt('fmc_lead'); }

  fetch(KGSK_LEAD_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  .then(function(r) {
    if (r.ok) {
      if (statusEl) {
        statusEl.className = 'fmc-send-status sent';
        statusEl.innerHTML = buildSendStatusHTML('sent', null);
      }
      if (window.KGSK_ANALYTICS) { KGSK_ANALYTICS.directSendSuccess('fmc_lead'); }
    } else {
      if (statusEl) {
        statusEl.className = 'fmc-send-status failed';
        statusEl.innerHTML = buildSendStatusHTML('failed', payload);
      }
      if (window.KGSK_ANALYTICS) { KGSK_ANALYTICS.directSendFailure('fmc_lead', 'http_' + r.status); }
    }
  })
  .catch(function() {
    if (statusEl) {
      statusEl.className = 'fmc-send-status failed';
      statusEl.innerHTML = buildSendStatusHTML('failed', payload);
    }
    if (window.KGSK_ANALYTICS) { KGSK_ANALYTICS.directSendFailure('fmc_lead', 'network_error'); }
  });
}

function buildSendStatusHTML(state, payload) {
  var isDE = currentLang === 'de';

  if (state === 'sent') {
    return '<div class="ssi-row"><span class="ssi-icon">✓</span>' +
      '<span class="ssi-text">' +
      (isDE ? 'Anfrage erfolgreich übermittelt — wir melden uns bald.' : 'Enquiry submitted — we will be in touch shortly.') +
      '</span></div>';
  }

  if (state === 'pending') {
    return '<div class="ssi-row"><span class="ssi-icon">⏳</span>' +
      '<span class="ssi-text">' +
      (isDE ? 'Anfrage wird versendet…' : 'Sending enquiry…') +
      '</span></div>';
  }

  /* Build fallback content from payload */
  var c   = (payload && payload.contact)  || {};
  var p   = (payload && payload.project)  || {};
  var s   = (payload && payload.scoring)  || {};
  var r   = (payload && payload.results)  || {};
  var m   = (payload && payload.meta)     || {};

  var bodyLines = [
    (isDE ? 'Name: '          : 'Name: ')         + (c.name  || ''),
    (isDE ? 'E-Mail: '        : 'Email: ')         + (c.email || ''),
    (isDE ? 'Telefon: '       : 'Phone: ')         + (c.phone || ''),
    (isDE ? 'Organisation: '  : 'Organisation: ')  + (c.org   || ''),
    '',
    (isDE ? 'Vorhaben: '      : 'Project: ')       + (p.project  || ''),
    (isDE ? 'Gebäudetyp: '   : 'Building type: ') + (p.building || ''),
    (isDE ? 'Bundesland: '    : 'Region: ')        + (p.land     || ''),
    (isDE ? 'Flächengröße: ' : 'Area size: ')     + (p.size     || ''),
    (isDE ? 'Zeitrahmen: '    : 'Timeline: ')      + (p.timeline || ''),
    '',
    (isDE ? 'Passende Programme: ' : 'Matched programmes: ') + (r.matched_ids ? r.matched_ids.length : 0),
    (isDE ? 'Förderpotenzial: '    : 'Funding potential: ')  + (r.potential_range || ''),
    (isDE ? 'Bewertung: '          : 'Score: ')              + (s.tier || '') + (s.score ? ' (' + s.score + '/100)' : ''),
    '',
    (isDE ? 'Zeitpunkt: ' : 'Timestamp: ') + (m.timestamp || new Date().toISOString())
  ];
  var summaryText = bodyLines.join('\n');

  var mailSubject = encodeURIComponent(
    isDE ? 'KGSK Förderanfrage (Direktkontakt)' : 'KGSK Funding Enquiry (Direct contact)'
  );
  var mailBody    = encodeURIComponent(summaryText);
  var mailtoHref  = 'mailto:office@kgsk.de?subject=' + mailSubject + '&body=' + mailBody;

  var copyOnclick = 'fmcCopySummary(' + "'" + encodeURIComponent(summaryText) + "'" + ')';
  var mailOnclick = "window.KGSK_ANALYTICS && KGSK_ANALYTICS.officialContactClick('fmc_" + state + "')";

  if (state === 'not-configured') {
    return '<div class="ssi-row"><span class="ssi-icon">ℹ️</span>' +
      '<span class="ssi-text">' +
      (isDE ? 'Demo-Modus — Anfrage nicht live versendet.' : 'Demo mode — enquiry not sent live.') +
      '</span></div>' +
      '<div class="ssi-fallback">' +
      '<a class="ssi-mailto" href="' + mailtoHref + '" target="_blank" onclick="' + mailOnclick + '">' +
      '✉️ ' + (isDE ? 'Direkt an office@kgsk.de' : 'Email office@kgsk.de') + '</a>' +
      '</div>';
  }

  /* failed */
  return '<div class="ssi-row"><span class="ssi-icon">⚠️</span>' +
    '<span class="ssi-text">' +
    (isDE ? 'Übermittlung fehlgeschlagen.' : 'Submission failed.') +
    '</span></div>' +
    '<div class="ssi-fallback">' +
    '<button class="ssi-copy" onclick="' + copyOnclick + '">' +
    '📋 ' + (isDE ? 'Zusammenfassung kopieren' : 'Copy summary') + '</button>' +
    '<a class="ssi-mailto" href="' + mailtoHref + '" target="_blank" onclick="' + mailOnclick + '">' +
    '✉️ ' + (isDE ? 'Direkt an office@kgsk.de' : 'Email office@kgsk.de') + '</a>' +
    '</div>';
}

function fmcCopySummary(encoded) {
  var text = decodeURIComponent(encoded);
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(function() {
      if (window.KGSK_ANALYTICS) { KGSK_ANALYTICS.summaryCopy('fmc_lead'); }
    });
  } else {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;left:-9999px;top:0;';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(ta);
    if (window.KGSK_ANALYTICS) { KGSK_ANALYTICS.summaryCopy('fmc_lead'); }
  }
}

/* --------------------------------------------------------------------------
   SECTION 7: Results Rendering
   -------------------------------------------------------------------------- */

function renderResults(programmes, payload) {
  var container = document.getElementById('fmc-results');
  if (!container) return;
  container.innerHTML = buildResultsHTML(programmes, payload);
}

function buildResultsHTML(programmes, payload) {
  var html = '';
  var lang = currentLang;

  /* — Summary box — */
  var tierBadge = '';
  if (payload.scoring && payload.scoring.tier === 'high') {
    tierBadge = '<span class="tier-badge tier-high">' + t('tier_high') + '</span>';
  } else if (payload.scoring && payload.scoring.tier === 'medium') {
    tierBadge = '<span class="tier-badge tier-medium">' + t('tier_medium') + '</span>';
  } else {
    tierBadge = '<span class="tier-badge tier-low">' + t('tier_low') + '</span>';
  }

  var titleText = programmes.length > 0
    ? programmes.length + ' ' + t('results_title_match')
    : t('results_title_none');

  html += '<div class="results-summary">';
  html += '<div class="eyebrow-sm">' + t('results_eyebrow') + '</div>';
  html += '<h2 class="results-title">' + titleText + '</h2>';
  html += '<p class="results-subtitle">' + t('results_subtitle') + '</p>';
  if (payload.results && payload.results.potential_range) {
    html += '<div class="results-potential"><span class="potential-amount">' + payload.results.potential_range + '</span></div>';
  }
  html += tierBadge;
  html += '</div>';

  /* — Programme cards — */
  if (programmes.length > 0) {
    html += '<div class="programme-list">';
    for (var i = 0; i < programmes.length; i++) {
      var prog = programmes[i];
      var isFirst = i === 0;
      var cardClass = 'program-card' + (isFirst ? ' highlight' : '');

      var badgeLabel = lang === 'de' ? (prog.badge_de || '') : (prog.badge_en || prog.badge_de || '');
      var levelClass = prog.level ? 'prog-badge level-' + prog.level : 'prog-badge';
      var progName = lang === 'de' ? (prog.name_de || prog.name_en || '') : (prog.name_en || prog.name_de || '');
      var progAmount = lang === 'de' ? (prog.amount_de || prog.amount_en || '') : (prog.amount_en || prog.amount_de || '');
      var progWhy = lang === 'de' ? (prog.match_why_de || prog.match_why_en || '') : (prog.match_why_en || prog.match_why_de || '');
      var progDesc = lang === 'de' ? (prog.short_desc_de || prog.short_desc_en || '') : (prog.short_desc_en || prog.short_desc_de || '');
      var progRegion = prog.region || '';
      var progLevel = prog.level || '';
      var progLastChecked = prog.last_checked || '';
      var progSourceUrl = prog.source_url || '#';
      var progSourceLabel = lang === 'de' ? (prog.source_label_de || prog.source_label_en || '') : (prog.source_label_en || prog.source_label_de || '');
      var deOnly = prog.source_de_only ? ' <span class="de-only-tag">' + t('source_de_only') + '</span>' : '';

      html += '<div class="' + cardClass + '">';
      html += '<div class="' + levelClass + '">' + badgeLabel + '</div>';
      html += '<div class="prog-content">';
      html += '<div class="prog-name">' + progName + '</div>';
      html += '<div class="prog-amount">' + progAmount + '</div>';
      html += '<div class="prog-why"><strong>' + t('prog_match_why') + ':</strong> ' + progWhy + '</div>';
      html += '<div class="prog-desc">' + progDesc + '</div>';
      html += '<div class="prog-meta">';
      html += '<span class="prog-region">' + progRegion + ' · ' + progLevel + '</span>';
      html += '<span class="prog-last-checked">' + t('prog_last_checked') + ': ' + progLastChecked + '</span>';
      html += '</div>';
      html += '<div class="prog-source">';
      html += '<a href="' + progSourceUrl + '" target="_blank" rel="noopener noreferrer" class="prog-source-link"' +
        ' onclick="window.KGSK_ANALYTICS && KGSK_ANALYTICS.sourceClick(\'' + prog.id + '\',\'' + progSourceUrl + '\')">';
      html += progSourceLabel + ' →' + deOnly;
      html += '</a>';
      html += '<span class="indicative-tag">' + t('prog_indicative') + '</span>';
      html += '</div>';
      html += '</div>';
      html += '</div>';
    }
    html += '</div>';
  } else {
    html += '<div class="no-results-msg">';
    html += '<p>' + t('results_none_msg') + '</p>';
    html += '</div>';
  }

  /* — Disclaimer — */
  html += '<div class="disclaimer-block">';
  html += '<p>' + t('results_disclaimer') + '</p>';
  html += '</div>';

  /* — Send status (updated async by postLeadPayload after render) — */
  html += '<div class="fmc-send-status pending" id="fmc-send-status">' +
    '<div class="ssi-row"><span class="ssi-icon">⏳</span>' +
    '<span class="ssi-text">' + (currentLang === 'de' ? 'Anfrage wird versendet…' : 'Sending enquiry…') + '</span></div>' +
    '</div>';

  /* — CTA block — */
  html += '<div class="fmc-cta" id="fmc-cta-block">';
  html += '<div class="cta-inner">';
  html += '<div class="cta-text">';
  html += '<div class="eyebrow-sm">' + t('cta_services_title') + '</div>';
  html += '<h3>' + t('cta_title') + '</h3>';
  html += '<p>' + t('cta_subtitle') + '</p>';
  html += '</div>';
  html += '<div class="cta-services">';
  html += '<div class="service-cards">';
  for (var s = 1; s <= 4; s++) {
    html += '<div class="service-card">' +
      '<div class="sc-name">' + t('service_' + s + '_name') + '</div>' +
      '<div class="sc-desc">' + t('service_' + s + '_desc') + '</div>' +
      '</div>';
  }
  html += '</div>';
  html += '</div>';
  html += '<div class="cta-btns">';
  html += '<a href="https://kgsk.de/kontakt" class="btn-cta" target="_blank" rel="noopener noreferrer"' +
    ' onclick="window.KGSK_ANALYTICS && KGSK_ANALYTICS.ctaClick(\'fmc_primary\',\'kgsk.de/kontakt\')">' + t('cta_btn_primary') + '</a>';
  html += '<a href="https://kgsk.de" class="btn-cta-secondary" target="_blank" rel="noopener noreferrer"' +
    ' onclick="window.KGSK_ANALYTICS && KGSK_ANALYTICS.ctaClick(\'fmc_secondary\',\'kgsk.de\')">' + t('cta_btn_secondary') + '</a>';
  html += '</div>';
  html += '</div>';
  html += '<button class="restart-link" onclick="window.KGSK_APP.fmcRestart()">' + t('btn_restart') + '</button>';
  html += '</div>';

  return html;
}

/* --------------------------------------------------------------------------
   SECTION 8: Lead Form Rendering
   -------------------------------------------------------------------------- */

function renderLeadStep() {
  var container = document.getElementById('fmc-step-4');
  if (!container) return;

  container.innerHTML = '<div class="lead-step">' +
    '<div class="lead-intro">' +
    '<div class="eyebrow-sm">' + t('lead_eyebrow') + '</div>' +
    '<h3 class="step-q">' + t('lead_title') + '</h3>' +
    '<p class="step-hint">' + t('lead_subtitle') + '</p>' +
    '</div>' +
    '<form class="lead-form" id="lead-form" onsubmit="return false;">' +
    '<div class="form-row">' +
    '<div class="form-group">' +
    '<label class="form-label">' + t('lead_name') + ' *</label>' +
    '<input type="text" class="form-input" id="lead-name" placeholder="' + t('lead_name_ph') + '" oninput="KGSK_APP.updateLeadField(\'name\', this.value)">' +
    '</div>' +
    '<div class="form-group">' +
    '<label class="form-label">' + t('lead_email') + ' *</label>' +
    '<input type="email" class="form-input" id="lead-email" placeholder="' + t('lead_email_ph') + '" oninput="KGSK_APP.updateLeadField(\'email\', this.value)">' +
    '</div>' +
    '</div>' +
    '<div class="form-row">' +
    '<div class="form-group">' +
    '<label class="form-label">' + t('lead_phone') + '</label>' +
    '<input type="tel" class="form-input" id="lead-phone" placeholder="' + t('lead_phone_ph') + '" oninput="KGSK_APP.updateLeadField(\'phone\', this.value)">' +
    '</div>' +
    '<div class="form-group">' +
    '<label class="form-label">' + t('lead_org') + '</label>' +
    '<input type="text" class="form-input" id="lead-org" placeholder="' + t('lead_org_ph') + '" oninput="KGSK_APP.updateLeadField(\'org\', this.value)">' +
    '</div>' +
    '</div>' +
    '<div class="form-group">' +
    '<label class="form-label">' + t('lead_interest') + '</label>' +
    '<div class="radio-group">' +
    '<label class="radio-opt"><input type="radio" name="interest" value="yes" onchange="KGSK_APP.updateLeadField(\'interest\',\'yes\')"> ' + t('lead_interest_yes') + '</label>' +
    '<label class="radio-opt"><input type="radio" name="interest" value="screening" onchange="KGSK_APP.updateLeadField(\'interest\',\'screening\')"> ' + t('lead_interest_screening') + '</label>' +
    '<label class="radio-opt"><input type="radio" name="interest" value="info" onchange="KGSK_APP.updateLeadField(\'interest\',\'info\')"> ' + t('lead_interest_info') + '</label>' +
    '</div>' +
    '</div>' +
    '<div class="consent-block">' +
    '<label class="consent-check">' +
    '<input type="checkbox" id="lead-consent" onchange="KGSK_APP.updateLeadField(\'consent\', this.checked)">' +
    '<span>' + t('lead_consent') + '</span>' +
    '</label>' +
    '</div>' +
    '<div id="lead-validation-msg" class="validation-msg hidden"></div>' +
    '</form>' +
    '</div>';

  /* Restore values if any already entered */
  var nameEl = document.getElementById('lead-name');
  if (nameEl && leadData.name) nameEl.value = leadData.name;
  var emailEl = document.getElementById('lead-email');
  if (emailEl && leadData.email) emailEl.value = leadData.email;
  var phoneEl = document.getElementById('lead-phone');
  if (phoneEl && leadData.phone) phoneEl.value = leadData.phone;
  var orgEl = document.getElementById('lead-org');
  if (orgEl && leadData.org) orgEl.value = leadData.org;
  var consentEl = document.getElementById('lead-consent');
  if (consentEl) consentEl.checked = leadData.consent;
  if (leadData.interest) {
    var radios = document.querySelectorAll('input[name="interest"]');
    for (var i = 0; i < radios.length; i++) {
      if (radios[i].value === leadData.interest) {
        radios[i].checked = true;
      }
    }
  }
}

function updateLeadField(key, val) {
  leadData[key] = val;
  updateNextBtn();
}

/* --------------------------------------------------------------------------
   SECTION 9: Details Step (Step 3) Rendering
   -------------------------------------------------------------------------- */

var BUNDESLAENDER = [
  { val: 'nrw', label: 'Nordrhein-Westfalen' },
  { val: 'bay', label: 'Bayern' },
  { val: 'baw', label: 'Baden-Württemberg' },
  { val: 'ber', label: 'Berlin' },
  { val: 'bra', label: 'Brandenburg' },
  { val: 'bre', label: 'Bremen' },
  { val: 'ham', label: 'Hamburg' },
  { val: 'hes', label: 'Hessen' },
  { val: 'mvo', label: 'Mecklenburg-Vorpommern' },
  { val: 'nie', label: 'Niedersachsen' },
  { val: 'rhe', label: 'Rheinland-Pfalz' },
  { val: 'saa', label: 'Saarland' },
  { val: 'sac', label: 'Sachsen' },
  { val: 'sat', label: 'Sachsen-Anhalt' },
  { val: 'sch', label: 'Schleswig-Holstein' },
  { val: 'thu', label: 'Thüringen' }
];

function renderDetailsStep() {
  var container = document.getElementById('fmc-step-3');
  if (!container) return;

  var landOptions = '';
  for (var i = 0; i < BUNDESLAENDER.length; i++) {
    var selected = BUNDESLAENDER[i].val === fmcState.land ? ' selected' : '';
    landOptions += '<option value="' + BUNDESLAENDER[i].val + '"' + selected + '>' + BUNDESLAENDER[i].label + '</option>';
  }

  var sizeBtns = '';
  var sizeVals = ['klein', 'mittel', 'gross'];
  for (var s = 0; s < sizeVals.length; s++) {
    var activeClass = fmcState.size === sizeVals[s] ? ' active' : '';
    sizeBtns += '<button class="size-btn' + activeClass + '" data-val="' + sizeVals[s] + '" onclick="KGSK_APP.setFMCSize(\'' + sizeVals[s] + '\')">' + t('size_' + sizeVals[s]) + '</button>';
  }

  var timelineOptions = '';
  var timelineVals = ['now', '6m', '1y', 'later'];
  for (var ti = 0; ti < timelineVals.length; ti++) {
    var tSel = fmcState.timeline === timelineVals[ti] ? ' selected' : '';
    timelineOptions += '<option value="' + timelineVals[ti] + '"' + tSel + '>' + t('timeline_' + timelineVals[ti]) + '</option>';
  }

  var budgetOptions = '';
  var budgetVals = ['under50', '50_200', '200_500', 'over500', 'unknown'];
  for (var bi = 0; bi < budgetVals.length; bi++) {
    var bSel = fmcState.budget === budgetVals[bi] ? ' selected' : '';
    budgetOptions += '<option value="' + budgetVals[bi] + '"' + bSel + '>' + t('budget_' + budgetVals[bi]) + '</option>';
  }

  container.innerHTML =
    '<div class="details-step">' +
    '<div class="form-group">' +
    '<label class="form-label">' + t('details_land_label') + '</label>' +
    '<select class="form-select" id="fmc-land-select" onchange="KGSK_APP.setFMCLand(this.value)">' +
    landOptions +
    '</select>' +
    '</div>' +
    '<div class="form-group">' +
    '<label class="form-label">' + t('details_size_label') + '</label>' +
    '<div class="size-btn-group">' + sizeBtns + '</div>' +
    '</div>' +
    '<div class="form-group">' +
    '<label class="form-label">' + t('details_timeline_label') + '</label>' +
    '<select class="form-select" id="fmc-timeline-select" onchange="KGSK_APP.setFMCTimeline(this.value)">' +
    '<option value="">' + t('details_select_placeholder') + '</option>' +
    timelineOptions +
    '</select>' +
    '</div>' +
    '<div class="form-group">' +
    '<label class="form-label">' + t('details_budget_label') + '</label>' +
    '<select class="form-select" id="fmc-budget-select" onchange="KGSK_APP.setFMCBudget(this.value)">' +
    '<option value="">' + t('details_select_placeholder') + '</option>' +
    budgetOptions +
    '</select>' +
    '</div>' +
    '</div>';
}

function setFMCLand(val) {
  fmcState.land = val;
  updateNextBtn();
}

function setFMCSize(val) {
  fmcState.size = val;
  var sizeBtns = document.querySelectorAll('.size-btn');
  for (var i = 0; i < sizeBtns.length; i++) {
    if (sizeBtns[i].getAttribute('data-val') === val) {
      sizeBtns[i].className = sizeBtns[i].className.replace(/\bactive\b/g, '').trim() + ' active';
    } else {
      sizeBtns[i].className = sizeBtns[i].className.replace(/\bactive\b/g, '').trim();
    }
  }
  updateNextBtn();
}

function setFMCTimeline(val) {
  fmcState.timeline = val;
  updateNextBtn();
}

function setFMCBudget(val) {
  fmcState.budget = val;
  updateNextBtn();
}

/* --------------------------------------------------------------------------
   SECTION 10: ROI Calculator
   -------------------------------------------------------------------------- */

var roiState = {
  area: 300,
  type: 'extensiv',
  land: 'nrw',
  quality: 2,
  context: 'elevated',
  substrate: 'shallow',
  vegDiv: 'mixed',
  buildingUse: 'commercial',
  buildingAge: 'existing_young',
  flowering: 'some',
  maintenance: 'moderate',
  irrigation: false
};

var ROI_COSTS = {
  extensiv:    [[30, 50],  [45, 70],  [60, 85]],
  intensiv:    [[120, 200],[160, 260],[200, 320]],
  fassade:     [[80, 140], [110, 170],[140, 210]],
  regenwasser: [[50, 90],  [70, 110], [90, 140]]
};

var RAIN_FEES = {
  nrw: 1.55, bay: 1.20, baw: 1.40, ber: 1.85, bra: 0.95, bre: 0.85,
  ham: 0.92, hes: 1.10, mvo: 0.80, nie: 1.00, rhe: 1.15, saa: 0.90,
  sac: 0.88, sat: 0.85, sch: 0.95, thu: 0.82
};

var ENERGY_SAVINGS = { extensiv: 0.8, intensiv: 2.2, fassade: 3.5, regenwasser: 0.3 };
var MAINTENANCE    = { extensiv: 1.5, intensiv: 4.0, fassade: 3.0, regenwasser: 2.5 };
var RETENTION      = { extensiv: 0.45, intensiv: 0.65, fassade: 0.35, regenwasser: 0.85 };

function subsidyRate(land) {
  if (land === 'nrw') return 0.30;
  if (land === 'bay') return 0.30;
  if (land === 'baw') return 0.25;
  if (land === 'ber') return 0.35;
  if (land === 'ham') return 0.40;
  return 0.20;
}

function fmtEuro(n) {
  return Math.round(n).toLocaleString('de-DE', { maximumFractionDigits: 0 }) + ' €';
}

function calcROI() {
  var costs = ROI_COSTS[roiState.type][roiState.quality - 1];
  var costMid = (costs[0] + costs[1]) / 2;
  var totalCost = roiState.area * costMid;
  var subsidy = totalCost * subsidyRate(roiState.land);
  var netCost = totalCost - subsidy;
  var rainFee = RAIN_FEES[roiState.land] || 1.00;
  var retention = RETENTION[roiState.type];
  var annualRain = roiState.area * rainFee * retention;
  var annualEnergy = roiState.area * ENERGY_SAVINGS[roiState.type];
  var annualMaint = roiState.area * MAINTENANCE[roiState.type];
  var annualNet = annualRain + annualEnergy - annualMaint;
  var payback = annualNet > 0 ? netCost / annualNet : 99;

  setElText('roi-total-cost', fmtEuro(totalCost));
  setElText('roi-net-cost', fmtEuro(netCost));
  setElText('roi-rain-saving', fmtEuro(annualRain));
  setElText('roi-energy-saving', fmtEuro(annualEnergy));
  setElText('roi-maintenance', fmtEuro(annualMaint));
  setElText('roi-annual-net', fmtEuro(annualNet));
  setElText('roi-payback-val', payback >= 99
    ? t('roi_payback_never')
    : fmt(Math.round(payback)) + ' ' + t('roi_years'));

  var bar = document.getElementById('roi-payback-bar');
  if (bar) {
    var barClass = 'roi-payback-bar';
    if (payback < 10) {
      barClass += ' good';
    } else if (payback < 20) {
      barClass += ' ok';
    } else if (payback < 25) {
      barClass += ' long';
    } else {
      barClass += ' never';
    }
    bar.className = barClass;
    bar.style.width = Math.min((payback / 25) * 100, 100) + '%';
  }

  if (window.KGSK_ANALYTICS) {
    KGSK_ANALYTICS.roiResultView(
      roiState.type,
      roiState.area,
      payback >= 99 ? null : Math.round(payback)
    );
  }

  // --- Extended benefit model ---
  if (window.KGSK_BENEFITS) {
    var benefitInputs = {
      area: roiState.area,
      type: roiState.type,
      quality: roiState.quality,
      land: roiState.land,
      buildingAge: roiState.buildingAge,
      hasRainFee: true,
      substrate_depth: roiState.substrate,
      veg_diversity: roiState.vegDiv,
      flowering_share: roiState.flowering,
      maintenance: roiState.maintenance,
      irrigation: roiState.irrigation,
      context: roiState.context,
      traffic_load: 'medium',
      leaf_area: roiState.type === 'intensiv' || roiState.type === 'fassade' ? 'high' : 'low',
      building_type: roiState.buildingUse
    };

    var report = window.KGSK_BENEFITS.buildReport(benefitInputs);
    renderBenefitReport(report);
  }
}

function setElText(id, val) {
  var el = document.getElementById(id);
  if (el) el.textContent = val;
}

function setROIType(type) {
  roiState.type = type;
  var typeBtns = document.querySelectorAll('.roi-type-btn');
  for (var i = 0; i < typeBtns.length; i++) {
    if (typeBtns[i].getAttribute('data-val') === type) {
      typeBtns[i].className = typeBtns[i].className.replace(/\bactive\b/g, '').trim() + ' active';
    } else {
      typeBtns[i].className = typeBtns[i].className.replace(/\bactive\b/g, '').trim();
    }
  }
  calcROI();
}

function setROILand(land) {
  roiState.land = land;
  calcROI();
}

function setROIArea(val) {
  roiState.area = parseInt(val, 10) || 300;
  var areaValEl = document.getElementById('roi-area-val');
  if (areaValEl) areaValEl.textContent = fmt(roiState.area) + ' m²';
  calcROI();
}

function setROIQuality(val) {
  roiState.quality = parseInt(val, 10) || 2;
  var labels = currentLang === 'de'
    ? ['Einfach', 'Standard', 'Premium']
    : ['Basic', 'Standard', 'Premium'];
  var qualValEl = document.getElementById('roi-quality-val');
  if (qualValEl) qualValEl.textContent = labels[roiState.quality - 1];
  calcROI();
}

function renderBenefitReport(report) {
  var lang = currentLang;

  var en = report.monetized.energy;
  var el = document.getElementById('ben-energy-val');
  if (el) el.textContent = fmt(en.over_25y_mid) + ' €';
  var er = document.getElementById('ben-energy-range');
  if (er) er.textContent = t('range_note') + ': ' + fmt(en.over_25y_low) + ' – ' + fmt(en.over_25y_high) + ' €';

  var sw = report.monetized.stormwater;
  var sv = document.getElementById('ben-storm-val');
  if (sv) sv.textContent = fmt(sw.over_25y_mid) + ' €';
  var sr = document.getElementById('ben-storm-range');
  if (sr) sr.textContent = t('range_note') + ': ' + fmt(sw.over_25y_low) + ' – ' + fmt(sw.over_25y_high) + ' €';

  var roofWrap = document.getElementById('ben-roof-wrap');
  var isRoofType = ['extensiv','intensiv','retentions','solargruen','schraeg'].indexOf(roiState.type) !== -1;
  if (roofWrap) roofWrap.style.display = isRoofType ? 'block' : 'none';
  if (isRoofType) {
    var rl = report.monetized.roofLifespan;
    var rv = document.getElementById('ben-roof-val');
    if (rv) rv.textContent = fmt(rl.deferred_value_mid) + ' €';
    var rr = document.getElementById('ben-roof-range');
    if (rr) rr.textContent = t('range_note') + ': ' + fmt(rl.deferred_value_low) + ' – ' + fmt(rl.deferred_value_high) + ' €';
    var ra = document.getElementById('ben-roof-assumption');
    if (ra) ra.textContent = lang === 'de' ? rl.assumption_note_de : rl.assumption_note_en;
  }

  // Locked detail nudge
  var lockedEl = document.getElementById('roi-locked-nudge');
  if (lockedEl) {
    lockedEl.textContent = t('locked_detail_note');
  }

  var bio = report.scores.biodiversity;
  var bioBar = document.getElementById('cob-bio-bar');
  if (bioBar) bioBar.style.width = bio.score + '%';
  var bioScore = document.getElementById('cob-bio-score');
  if (bioScore) bioScore.textContent = bio.score + '/100';
  var bioLabel = document.getElementById('cob-bio-label');
  if (bioLabel) bioLabel.textContent = lang === 'de' ? bio.label : bio.label_en;

  var aq = report.scores.airQuality;
  var aqBar = document.getElementById('cob-air-bar');
  if (aqBar) aqBar.style.width = aq.score + '%';
  var aqScore = document.getElementById('cob-air-score');
  if (aqScore) aqScore.textContent = aq.score + '/100';
  var aqLabel = document.getElementById('cob-air-label');
  if (aqLabel) aqLabel.textContent = lang === 'de' ? aq.label : aq.label_en;

  var ae = report.scores.aesthetics;
  var aeBar = document.getElementById('cob-aes-bar');
  if (aeBar) aeBar.style.width = ae.score + '%';
  var aeScore = document.getElementById('cob-aes-score');
  if (aeScore) aeScore.textContent = ae.score + '/100';
  var aeLabel = document.getElementById('cob-aes-label');
  if (aeLabel) aeLabel.textContent = lang === 'de' ? ae.label : ae.label_en;

  // Strategic section note
  var stratNote = document.getElementById('roi-strategic-note');
  if (stratNote) {
    stratNote.textContent = t('strategic_section_note');
  }

  var rec = window.KGSK_BENEFITS.recommendNextStep(report, leadData);
  var nsbAction = document.getElementById('nsb-action-text');
  if (nsbAction) nsbAction.textContent = lang === 'de' ? rec.action_de : rec.action_en;
  var nsbService = document.getElementById('nsb-service-text');
  if (nsbService) nsbService.textContent = lang === 'de' ? rec.service_de : rec.service_en;

  renderMethodology(report.methodology, lang);
}

function renderMethodology(methodology, lang) {
  var el = document.getElementById('methodology-text');
  if (!el || !methodology) return;

  var html = '<div class="method-intro">' +
    '<p>' + t('method_intro_text') + '</p>' +
    '</div>';
  html += '<div class="method-section">';
  html += '<h4>' + t('method_monetized_title') + '</h4><ul>';
  var mItems = lang === 'de' ? methodology.monetized_de : methodology.monetized_en;
  for (var i = 0; i < mItems.length; i++) {
    html += '<li>' + mItems[i] + '</li>';
  }
  html += '</ul></div>';

  html += '<div class="method-section">';
  html += '<h4>' + t('method_scored_title') + '</h4><ul>';
  var sItems = lang === 'de' ? methodology.scored_de : methodology.scored_en;
  for (var i = 0; i < sItems.length; i++) {
    html += '<li>' + sItems[i] + '</li>';
  }
  html += '</ul></div>';

  html += '<div class="method-section">';
  html += '<h4>' + t('method_not_included_title') + '</h4><ul>';
  var nItems = lang === 'de' ? methodology.not_included_de : methodology.not_included_en;
  for (var i = 0; i < nItems.length; i++) {
    html += '<li>' + nItems[i] + '</li>';
  }
  html += '</ul></div>';

  html += '<div class="method-expert">' + (lang === 'de' ? methodology.expert_review_de : methodology.expert_review_en) + '</div>';

  el.innerHTML = html;
}

function toggleMethodology() {
  var content = document.getElementById('methodology-content');
  var arrow = document.getElementById('method-arrow');
  if (!content) return;
  var isOpen = content.style.display !== 'none';
  content.style.display = isOpen ? 'none' : 'block';
  if (arrow) arrow.textContent = isOpen ? '▼' : '▲';
}

function setROIContext(val)     { roiState.context = val; calcROI(); }
function setROISubstrate(val)   { roiState.substrate = val; updateSizeBtnGroup('roi-substrate-btns', val); calcROI(); }
function setROIVegDiv(val)      {
  roiState.vegDiv = val;
  var btns = document.querySelectorAll('[onclick*="setROIVegDiv"]');
  for (var i = 0; i < btns.length; i++) {
    var bval = btns[i].getAttribute('data-val');
    if (bval === val) btns[i].className = btns[i].className.replace(/\bactive\b/,'').trim() + ' active';
    else btns[i].className = btns[i].className.replace(/\bactive\b/,'').trim();
  }
  calcROI();
}
function setROIBuildingUse(val) { roiState.buildingUse = val; calcROI(); }

function updateSizeBtnGroup(containerId, val) {
  var container = document.getElementById(containerId);
  if (!container) return;
  var btns = container.querySelectorAll('.size-btn');
  for (var i = 0; i < btns.length; i++) {
    if (btns[i].getAttribute('data-val') === val) {
      btns[i].className = btns[i].className.replace(/\bactive\b/,'').trim() + ' active';
    } else {
      btns[i].className = btns[i].className.replace(/\bactive\b/,'').trim();
    }
  }
}

/* --------------------------------------------------------------------------
   SECTION 11: renderAll
   -------------------------------------------------------------------------- */

function renderAll() {
  updateLangButtons();
  renderStaticStrings();
  if (currentTab === 'fordermittelcheck') {
    renderFMC();
    if (fmcSubmitted && lastPayload) {
      renderResults(matchedProgrammes, lastPayload);
    }
  }
  if (currentTab === 'roi') {
    calcROI();
  }
}

function renderStaticStrings() {
  var els = document.querySelectorAll('[data-i18n]');
  for (var i = 0; i < els.length; i++) {
    var key = els[i].getAttribute('data-i18n');
    els[i].textContent = t(key);
  }

  var phs = document.querySelectorAll('[data-i18n-ph]');
  for (var j = 0; j < phs.length; j++) {
    var phKey = phs[j].getAttribute('data-i18n-ph');
    phs[j].placeholder = t(phKey);
  }
}

/* --------------------------------------------------------------------------
   SECTION 12: Helpers
   -------------------------------------------------------------------------- */

function fmt(n) {
  return Math.round(n).toLocaleString('de-DE');
}

function showResultsSection(show) {
  var el = document.getElementById('fmc-results-wrapper');
  if (el) el.style.display = show ? 'block' : 'none';

  var nav = document.getElementById('fmc-nav');
  if (nav) nav.style.display = show ? 'none' : 'flex';

  var stepper = document.getElementById('fmc-progress');
  if (stepper) stepper.style.display = show ? 'none' : 'block';
}

/* --------------------------------------------------------------------------
   SECTION 13: Initialization
   -------------------------------------------------------------------------- */

function init() {
  renderAll();
  renderDetailsStep();
  renderLeadStep();
  calcROI();
  if (window.KGSK_ANALYTICS) { KGSK_ANALYTICS.toolStart(currentLang); }

  /* URL param routing — supports ?tab=roi or ?tab=fordermittelcheck */
  var tabParam = (window.location.search.match(/[?&]tab=([^&]+)/) || [])[1];
  if (tabParam && (tabParam === 'roi' || tabParam === 'fordermittelcheck')) {
    switchTab(tabParam);
  }

  var areaRange = document.getElementById('roi-area');
  if (areaRange) {
    areaRange.addEventListener('input', function() {
      roiState.area = parseInt(this.value, 10);
      var areaValEl = document.getElementById('roi-area-val');
      if (areaValEl) areaValEl.textContent = fmt(roiState.area) + ' m²';
      calcROI();
    });
  }

  var qualRange = document.getElementById('roi-quality');
  if (qualRange) {
    qualRange.addEventListener('input', function() {
      roiState.quality = parseInt(this.value, 10);
      var labels = currentLang === 'de'
        ? ['Einfach', 'Standard', 'Premium']
        : ['Basic', 'Standard', 'Premium'];
      var qualValEl = document.getElementById('roi-quality-val');
      if (qualValEl) qualValEl.textContent = labels[roiState.quality - 1];
      calcROI();
    });
  }
}

document.addEventListener('DOMContentLoaded', init);

/* --------------------------------------------------------------------------
   SECTION 14: Public API
   -------------------------------------------------------------------------- */

window.KGSK_APP = {
  setLang:            setLang,
  switchTab:          switchTab,
  selectOption:       selectOption,
  fmcNext:            fmcNext,
  fmcBack:            fmcBack,
  fmcRestart:         fmcRestart,
  updateLeadField:    updateLeadField,
  setROIType:         setROIType,
  setROILand:         setROILand,
  setROIArea:         setROIArea,
  setROIQuality:      setROIQuality,
  setFMCLand:         setFMCLand,
  setFMCSize:         setFMCSize,
  setFMCTimeline:     setFMCTimeline,
  setFMCBudget:       setFMCBudget,
  setROIContext:      setROIContext,
  setROISubstrate:    setROISubstrate,
  setROIVegDiv:       setROIVegDiv,
  setROIBuildingUse:  setROIBuildingUse,
  toggleMethodology:  toggleMethodology
};
