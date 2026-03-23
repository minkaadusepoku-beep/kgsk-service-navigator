/* =============================================================================
   KGSK BENEFIT CALCULATION ENGINE
   Hybrid model: Layer A (monetized) + Layer B (scored/proxy)
   ES5-compatible vanilla JS
   ============================================================================= */

(function (global) {
  'use strict';

  /* ---------------------------------------------------------------------------
     INTERNAL LOOKUP TABLES
     ------------------------------------------------------------------------- */

  var RAINFALL_BY_LAND = {
    nrw: 800, bay: 950, baw: 900, ber: 590, bra: 560,
    bre: 720, ham: 760, hes: 750, mvo: 600, nie: 700,
    rhe: 780, saa: 820, sac: 640, sat: 520, sch: 800, thu: 680
  };

  var DRAINAGE_FEE_BY_LAND = {
    nrw: 1.55, ham: 0.92, ber: 1.85, bay: 1.20, baw: 1.40
  };
  var DRAINAGE_FEE_DEFAULT = 1.00;

  var RETENTION_RATES = {
    extensiv:    0.45,
    intensiv:    0.65,
    retentions:  0.80,
    solargruen:  0.40,
    schraeg:     0.35,
    fassade:     0.20,
    regenwasser: 0.85
  };

  var ENERGY_RATES = {
    extensiv:    { low: 0.6, mid: 0.9, high: 1.2 },
    intensiv:    { low: 1.5, mid: 2.2, high: 3.0 },
    fassade:     { low: 2.5, mid: 3.5, high: 4.5 },
    regenwasser: { low: 0.2, mid: 0.3, high: 0.4 },
    retentions:  { low: 0.6, mid: 0.9, high: 1.2 },
    solargruen:  { low: 0.6, mid: 0.9, high: 1.2 },
    schraeg:     { low: 0.5, mid: 0.7, high: 1.0 }
  };

  var CONVENTIONAL_COST_BY_QUALITY = { 1: 45, 2: 60, 3: 80 };

  /* ---------------------------------------------------------------------------
     INTERNAL HELPERS
     ------------------------------------------------------------------------- */

  function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
  }

  function round2(val) {
    return Math.round(val * 100) / 100;
  }

  function safeNum(val, fallback) {
    var n = Number(val);
    return (isNaN(n) || val === null || val === undefined) ? (fallback || 0) : n;
  }

  function safeStr(val, fallback) {
    return (val !== null && val !== undefined && typeof val === 'string' && val.length > 0)
      ? val : (fallback || '');
  }

  function qualityLabel(q) {
    var qn = safeNum(q, 2);
    if (qn === 1) return 'Basis';
    if (qn === 3) return 'Premium';
    return 'Standard';
  }

  /* ---------------------------------------------------------------------------
     A1. ROOF LIFESPAN EXTENSION — calcRoofLifespan(inputs)
     ------------------------------------------------------------------------- */

  function calcRoofLifespan(inputs) {
    inputs = inputs || {};

    var area    = safeNum(inputs.area, 0);
    var type    = safeStr(inputs.type, 'extensiv');
    var quality = safeNum(inputs.quality, 2);
    var buildingAge = safeStr(inputs.buildingAge, 'new');

    if (quality < 1 || quality > 3) { quality = 2; }

    var deferred_years = (quality === 3) ? 20 : 15;
    var conventional_cost_per_m2 = CONVENTIONAL_COST_BY_QUALITY[quality] || 60;

    // Over a 40-year analysis period, a conventional roof is replaced once (~25–30y mark).
    // A green-roof-protected membrane avoids that replacement cycle.
    var replacement_cycles_saved = 1;

    var deferred_value_mid  = round2(area * conventional_cost_per_m2);
    var deferred_value_low  = round2(deferred_value_mid * 0.70);
    var deferred_value_high = round2(deferred_value_mid * 1.00);

    var note_de = 'Grünes Dach schützt die Abdichtungsbahn vor UV und Thermoschock. '
      + 'Typische Nutzungsdauer konventionell: 25–30 Jahre. Mit Gründach: 40–60 Jahre. '
      + 'Qualitätsstufe ' + quality + ' (' + qualityLabel(quality) + '): '
      + deferred_years + ' Jahre verschobene Erneuerung angesetzt. '
      + 'Konventionelle Erneuerungskosten: ' + conventional_cost_per_m2 + ' €/m² (Schätzwert, zzgl. MwSt.). '
      + 'Gebäudealter-Kategorie: ' + buildingAge + '.';

    var note_en = 'Green roof protects the waterproofing membrane from UV and thermal cycling. '
      + 'Conventional membrane lifespan: 25–30 years. With green roof: 40–60 years. '
      + 'Quality level ' + quality + ' (' + qualityLabel(quality) + '): '
      + deferred_years + ' years of deferred replacement assumed. '
      + 'Conventional replacement cost: ' + conventional_cost_per_m2 + ' €/m² (estimate, excl. VAT). '
      + 'Building age category: ' + buildingAge + '.';

    return {
      deferred_years:             deferred_years,
      conventional_cost_per_m2:  conventional_cost_per_m2,
      replacement_cycles_saved:  replacement_cycles_saved,
      deferred_value_low:        deferred_value_low,
      deferred_value_high:       deferred_value_high,
      deferred_value_mid:        deferred_value_mid,
      assumption_note_de:        note_de,
      assumption_note_en:        note_en,
      confidence:                'high'
    };
  }

  /* ---------------------------------------------------------------------------
     A2. STORMWATER BENEFIT — calcStormwater(inputs)
     ------------------------------------------------------------------------- */

  function calcStormwater(inputs) {
    inputs = inputs || {};

    var area       = safeNum(inputs.area, 0);
    var type       = safeStr(inputs.type, 'extensiv');
    var land       = safeStr(inputs.land, '').toLowerCase();
    var hasRainFee = (inputs.hasRainFee === true);

    var retention_rate = RETENTION_RATES[type] !== undefined
      ? RETENTION_RATES[type] : RETENTION_RATES['extensiv'];

    var rainfall_mm = RAINFALL_BY_LAND[land] !== undefined
      ? RAINFALL_BY_LAND[land] : 700;

    var fee_per_m2 = DRAINAGE_FEE_BY_LAND[land] !== undefined
      ? DRAINAGE_FEE_BY_LAND[land] : DRAINAGE_FEE_DEFAULT;

    // m³/year retained
    var annual_retention_m3 = round2(area * (rainfall_mm / 1000) * retention_rate);

    // Annual fee saving — only quantified if municipality charges drainage fee
    var annual_fee_saving_high = hasRainFee
      ? round2(area * retention_rate * fee_per_m2)
      : 0;
    // Conservative lower bound: 0.5× because not all municipalities apply full credit
    var annual_fee_saving_low = hasRainFee
      ? round2(annual_fee_saving_high * 0.5)
      : 0;
    var annual_fee_saving_mid = hasRainFee
      ? round2((annual_fee_saving_low + annual_fee_saving_high) / 2)
      : 0;

    var over_25y_low  = round2(annual_fee_saving_low  * 25);
    var over_25y_high = round2(annual_fee_saving_high * 25);
    var over_25y_mid  = round2(annual_fee_saving_mid  * 25);

    var landLabel = land ? land.toUpperCase() : 'unbekannt';

    var region_note_de = 'Niederschlag: ' + rainfall_mm + ' mm/Jahr (Region: ' + landLabel + '). '
      + 'Rückhaltequote (' + type + '): ' + Math.round(retention_rate * 100) + '%. '
      + 'Niederschlagsgebühr: ' + (hasRainFee ? fee_per_m2 + ' €/m²/Jahr' : 'nicht angegeben — kein Gebührenansatz') + '. '
      + 'Untergrenze mit Faktor 0,5, da nicht alle Kommunen volle Anrechnung gewähren.';

    var region_note_en = 'Rainfall: ' + rainfall_mm + ' mm/year (region: ' + landLabel + '). '
      + 'Retention rate (' + type + '): ' + Math.round(retention_rate * 100) + '%. '
      + 'Drainage fee: ' + (hasRainFee ? fee_per_m2 + ' €/m²/year' : 'not specified — no fee benefit calculated') + '. '
      + 'Lower bound uses 0.5× factor as not all municipalities grant full credit.';

    return {
      annual_retention_m3:     annual_retention_m3,
      annual_fee_saving_low:   annual_fee_saving_low,
      annual_fee_saving_high:  annual_fee_saving_high,
      annual_fee_saving_mid:   annual_fee_saving_mid,
      over_25y_low:            over_25y_low,
      over_25y_high:           over_25y_high,
      over_25y_mid:            over_25y_mid,
      region_note_de:          region_note_de,
      region_note_en:          region_note_en,
      confidence:              'high'
    };
  }

  /* ---------------------------------------------------------------------------
     A3. ENERGY BENEFIT — calcEnergy(inputs)
     ------------------------------------------------------------------------- */

  function calcEnergy(inputs) {
    inputs = inputs || {};

    var area    = safeNum(inputs.area, 0);
    var type    = safeStr(inputs.type, 'extensiv');
    var quality = safeNum(inputs.quality, 2);

    if (quality < 1 || quality > 3) { quality = 2; }

    var rates = ENERGY_RATES[type] || ENERGY_RATES['extensiv'];

    // Quality maps to low/mid/high rate
    var rate_per_m2;
    if (quality === 1) {
      rate_per_m2 = { low: rates.low, mid: rates.low, high: rates.mid };
    } else if (quality === 3) {
      rate_per_m2 = { low: rates.mid, mid: rates.high, high: rates.high };
    } else {
      rate_per_m2 = rates;
    }

    var annual_low  = round2(area * rate_per_m2.low);
    var annual_mid  = round2(area * rate_per_m2.mid);
    var annual_high = round2(area * rate_per_m2.high);

    return {
      annual_low:    annual_low,
      annual_mid:    annual_mid,
      annual_high:   annual_high,
      over_25y_low:  round2(annual_low  * 25),
      over_25y_mid:  round2(annual_mid  * 25),
      over_25y_high: round2(annual_high * 25),
      note_de:       'Operative Energieeinsparung (Heizung/Kühlung), kein HVAC-Investitionsvorteil eingerechnet.',
      note_en:       'Operational energy savings (heating/cooling); no HVAC CAPEX benefit included.',
      confidence:    'medium'
    };
  }

  /* ---------------------------------------------------------------------------
     B4. BIODIVERSITY SCORE — scoreBiodiversity(inputs)
     ------------------------------------------------------------------------- */

  function scoreBiodiversity(inputs) {
    inputs = inputs || {};

    var type           = safeStr(inputs.type, 'extensiv');
    var substrate      = safeStr(inputs.substrate_depth, 'shallow');
    var veg_diversity  = safeStr(inputs.veg_diversity, 'mono');
    var flowering      = safeStr(inputs.flowering_share, 'none');
    var maintenance    = safeStr(inputs.maintenance, 'moderate');
    var irrigation     = (inputs.irrigation === true);

    var BASE_SCORES = {
      extensiv:    45,
      intensiv:    65,
      retentions:  55,
      solargruen:  50,
      schraeg:     35,
      fassade:     40,
      regenwasser: 30
    };

    var score = BASE_SCORES[type] !== undefined ? BASE_SCORES[type] : 40;
    var factors = [];

    factors.push({
      key:      'type',
      impact:   score,
      label_de: 'Grundwert für Begrünungstyp (' + type + ')',
      label_en: 'Base score for greening type (' + type + ')'
    });

    var substrate_bonus = 0;
    if (substrate === 'medium') { substrate_bonus = 10; }
    else if (substrate === 'deep') { substrate_bonus = 20; }
    if (substrate_bonus > 0) {
      score += substrate_bonus;
      factors.push({
        key:      'substrate_depth',
        impact:   substrate_bonus,
        label_de: 'Substrattiefe (' + substrate + ')',
        label_en: 'Substrate depth (' + substrate + ')'
      });
    }

    var diversity_bonus = 0;
    if (veg_diversity === 'mixed') { diversity_bonus = 10; }
    else if (veg_diversity === 'diverse') { diversity_bonus = 20; }
    if (diversity_bonus > 0) {
      score += diversity_bonus;
      factors.push({
        key:      'veg_diversity',
        impact:   diversity_bonus,
        label_de: 'Vegetationsvielfalt (' + veg_diversity + ')',
        label_en: 'Vegetation diversity (' + veg_diversity + ')'
      });
    }

    var flowering_bonus = 0;
    if (flowering === 'some') { flowering_bonus = 8; }
    else if (flowering === 'high') { flowering_bonus = 15; }
    if (flowering_bonus > 0) {
      score += flowering_bonus;
      factors.push({
        key:      'flowering_share',
        impact:   flowering_bonus,
        label_de: 'Blühflächenanteil (' + flowering + ')',
        label_en: 'Flowering share (' + flowering + ')'
      });
    }

    var maint_bonus = 0;
    if (maintenance === 'minimal') { maint_bonus = 10; }
    else if (maintenance === 'moderate') { maint_bonus = 5; }
    if (maint_bonus > 0) {
      score += maint_bonus;
      factors.push({
        key:      'maintenance',
        impact:   maint_bonus,
        label_de: 'Pflegeintensität (' + maintenance + ')',
        label_en: 'Maintenance level (' + maintenance + ')'
      });
    }

    if (irrigation) {
      score -= 10;
      factors.push({
        key:      'irrigation',
        impact:   -10,
        label_de: 'Bewässerung (reduziert ökologischen Wert)',
        label_en: 'Irrigation (reduces ecological value)'
      });
    }

    score = clamp(score, 0, 100);

    var label, label_en;
    if (score < 40) {
      label = 'Niedriges Potenzial'; label_en = 'Limited potential';
    } else if (score < 70) {
      label = 'Mittleres Potenzial'; label_en = 'Moderate potential';
    } else {
      label = 'Hohes Potenzial'; label_en = 'Strong potential';
    }

    return {
      score:      score,
      label:      label,
      label_en:   label_en,
      factors:    factors,
      confidence: 'lower'
    };
  }

  /* ---------------------------------------------------------------------------
     B5. AIR QUALITY SCORE — scoreAirQuality(inputs)
     ------------------------------------------------------------------------- */

  function scoreAirQuality(inputs) {
    inputs = inputs || {};

    var type         = safeStr(inputs.type, 'extensiv');
    var context      = safeStr(inputs.context, 'elevated');
    var traffic_load = safeStr(inputs.traffic_load, 'medium');
    var leaf_area    = safeStr(inputs.leaf_area, 'medium');
    var area         = safeNum(inputs.area, 0);

    var score;
    if (type === 'fassade') {
      if (context === 'street_level') { score = 70; }
      else if (context === 'courtyard') { score = 50; }
      else { score = 45; }
    } else if (type === 'intensiv') {
      score = 40;
    } else if (type === 'extensiv') {
      score = 25;
    } else if (type === 'retentions') {
      score = 25;
    } else if (type === 'schraeg') {
      score = 20;
    } else if (type === 'solargruen') {
      score = 25;
    } else if (type === 'regenwasser') {
      score = 10;
    } else {
      score = 20;
    }

    if (traffic_load === 'high') { score += 15; }
    else if (traffic_load === 'low') { score -= 5; }

    if (leaf_area === 'high') { score += 10; }
    else if (leaf_area === 'low') { score -= 5; }

    if (area > 1000) { score += 10; }
    else if (area > 500) { score += 5; }

    score = clamp(score, 5, 100);

    var label, label_en;
    if (score < 30) {
      label = 'Geringer Beitrag'; label_en = 'Minor contribution';
    } else if (score < 60) {
      label = 'Moderater Beitrag'; label_en = 'Moderate contribution';
    } else {
      label = 'Erheblicher Beitrag'; label_en = 'Substantial contribution';
    }

    // Determine relevant pollutants based on context and traffic
    var pollutants = [];
    if (type === 'fassade' || context === 'street_level') {
      pollutants = ['PM2.5', 'PM10', 'NO2', 'O3'];
    } else if (traffic_load === 'high') {
      pollutants = ['PM2.5', 'PM10', 'NO2'];
    } else if (type === 'regenwasser') {
      pollutants = [];
    } else {
      pollutants = ['PM10', 'O3'];
    }

    var note_de = 'Schätzung basierend auf publizierten Phytoremediation-Studien (Aduse-Poku 2024/2025, Pugh et al.). '
      + 'Fassadenbegrünung auf Straßenniveau zeigt den höchsten Effekt für Partikel und NOx. '
      + 'Punktwert ist indikativ, keine Emissionsberechnung.';

    var note_en = 'Estimate based on published phytoremediation studies (Aduse-Poku 2024/2025, Pugh et al.). '
      + 'Facade greening at street level shows the highest effect for particulates and NOx. '
      + 'Score is indicative, not an emissions calculation.';

    return {
      score:      score,
      label:      label,
      label_en:   label_en,
      pollutants: pollutants,
      note_de:    note_de,
      note_en:    note_en,
      confidence: 'lower'
    };
  }

  /* ---------------------------------------------------------------------------
     B6. AESTHETICS / AMENITY SCORE — scoreAesthetics(inputs)
     ------------------------------------------------------------------------- */

  function scoreAesthetics(inputs) {
    inputs = inputs || {};

    var type          = safeStr(inputs.type, 'extensiv');
    var context       = safeStr(inputs.context, 'elevated');
    var veg_diversity = safeStr(inputs.veg_diversity, 'mono');
    var maintenance   = safeStr(inputs.maintenance, 'moderate');
    var building_type = safeStr(inputs.building_type, 'commercial');

    var BASE_SCORES = {
      intensiv:    70,
      fassade:     65,
      solargruen:  45,
      extensiv:    40,
      retentions:  35,
      schraeg:     40,
      regenwasser: 20
    };

    var score = BASE_SCORES[type] !== undefined ? BASE_SCORES[type] : 40;

    if (context === 'street_level') { score += 10; }
    else if (context === 'interior_visible') { score += 15; }
    else if (context === 'courtyard') { score += 5; }

    if (veg_diversity === 'diverse') { score += 15; }
    else if (veg_diversity === 'mixed') { score += 8; }

    if (maintenance === 'intensive') { score += 10; }
    else if (maintenance === 'moderate') { score += 5; }

    if (building_type === 'public') { score += 5; }
    else if (building_type === 'residential') { score += 8; }
    else if (building_type === 'industrial') { score -= 5; }

    score = clamp(score, 0, 100);

    var label, label_en;
    if (score < 40) {
      label = 'Geringe Aufwertung'; label_en = 'Limited upgrade';
    } else if (score < 70) {
      label = 'Moderate Aufwertung'; label_en = 'Moderate upgrade';
    } else {
      label = 'Erhebliche Aufwertung'; label_en = 'Substantial upgrade';
    }

    return {
      score:      score,
      label:      label,
      label_en:   label_en,
      note_de:    'Indikativ. Kein Ersatz für eine Immobilienbewertung.',
      note_en:    'Indicative. Not a substitute for a property valuation.',
      confidence: 'lower'
    };
  }

  /* ---------------------------------------------------------------------------
     C. COMBINED REPORT — buildReport(inputs)
     ------------------------------------------------------------------------- */

  function buildReport(inputs) {
    inputs = inputs || {};

    var roofLifespan  = calcRoofLifespan(inputs);
    var stormwater    = calcStormwater(inputs);
    var energy        = calcEnergy(inputs);
    var biodiversity  = scoreBiodiversity(inputs);
    var airQuality    = scoreAirQuality(inputs);
    var aesthetics    = scoreAesthetics(inputs);

    var hard_benefit_low  = round2(
      roofLifespan.deferred_value_low + stormwater.over_25y_low + energy.over_25y_low
    );
    var hard_benefit_high = round2(
      roofLifespan.deferred_value_high + stormwater.over_25y_high + energy.over_25y_high
    );
    var hard_benefit_mid  = round2(
      roofLifespan.deferred_value_mid + stormwater.over_25y_mid + energy.over_25y_mid
    );

    return {
      monetized: {
        roofLifespan: roofLifespan,
        stormwater:   stormwater,
        energy:       energy
      },
      scores: {
        biodiversity: biodiversity,
        airQuality:   airQuality,
        aesthetics:   aesthetics
      },
      totals: {
        hard_benefit_low:  hard_benefit_low,
        hard_benefit_mid:  hard_benefit_mid,
        hard_benefit_high: hard_benefit_high,
        note_de: 'Summe der monetarisierten Vorteile über 25 Jahre (Dachlebensdauer, Regenwasser, Energie). '
          + 'Alle Werte sind indikative Schätzungen vor Fördermitteln.',
        note_en: 'Sum of monetised benefits over 25 years (roof lifespan, stormwater, energy). '
          + 'All values are indicative estimates before subsidies.'
      },
      methodology: KGSK_BENEFITS.methodology
    };
  }

  /* ---------------------------------------------------------------------------
     E. RECOMMENDED NEXT STEP — recommendNextStep(report, leadData)
     ------------------------------------------------------------------------- */

  function recommendNextStep(report, leadData) {
    report   = report   || {};
    leadData = leadData || {};

    var totals = report.totals || {};
    var mid    = safeNum(totals.hard_benefit_mid, 0);

    var action_de, action_en, service_de, service_en, urgency;

    if (mid > 50000) {
      action_de  = 'Ihr Projekt weist ein erhebliches wirtschaftliches Potenzial auf. Wir empfehlen eine fundierte Wirtschaftlichkeitsanalyse und begleiten Sie beim Förderantrag.';
      action_en  = 'Your project shows significant economic potential. We recommend a thorough economic analysis and will support your funding application.';
      service_de = 'Wirtschaftlichkeitsanalyse & Förderantrag-Begleitung';
      service_en = 'Economic analysis & grant application support';
      urgency    = 'now';
    } else if (mid >= 10000) {
      action_de  = 'Ihr Projekt zeigt solides Potenzial. Eine Machbarkeitsprüfung hilft, die nächsten Schritte zu konkretisieren.';
      action_en  = 'Your project shows solid potential. A feasibility check will help define the next steps.';
      service_de = 'Machbarkeitsprüfung';
      service_en = 'Feasibility check';
      urgency    = 'soon';
    } else {
      action_de  = 'Sprechen Sie unverbindlich mit unserem Team — wir helfen Ihnen, das Potenzial Ihres Projekts einzuschätzen.';
      action_en  = 'Speak to our team with no obligation — we will help you assess your project\'s potential.';
      service_de = 'Kostenloses Erstgespräch';
      service_en = 'Free initial consultation';
      urgency    = 'when_ready';
    }

    return {
      action_de:  action_de,
      action_en:  action_en,
      service_de: service_de,
      service_en: service_en,
      urgency:    urgency
    };
  }

  /* ---------------------------------------------------------------------------
     D. METHODOLOGY DATA
     ------------------------------------------------------------------------- */

  var methodology = {
    monetized_de: [
      'Dachlebensdauer-Verlängerung: berechnet als verschobene Erneuerungskosten über 40 Jahre; basierend auf FLL-Datenblättern und Herstellerangaben (ZinCo, Bauder, IGRA).',
      'Regenwasserretention: indikative Schätzung auf Basis regionaler Niederschlagsdaten und Rückhaltequoten nach FLL.',
      'Energieeinsparung: operative Heiz-/Kühlenergieeinsparung nach typischen Literaturwerten (BBSR, ZinCo, Bauder).'
    ],
    monetized_en: [
      'Roof lifespan extension: calculated as deferred replacement cost over a 40-year analysis period; based on FLL data sheets and manufacturer data (ZinCo, Bauder, IGRA).',
      'Stormwater retention: indicative estimate based on regional rainfall data and retention rates per FLL.',
      'Energy savings: operational heating/cooling savings based on typical literature values (BBSR, ZinCo, Bauder).'
    ],
    scored_de: [
      'Biodiversität: Punktwert auf Basis von Substrattiefe, Artenvielfalt, Blühflächenanteil und Pflegepraktiken.',
      'Luftqualität: Einschätzung auf Basis publizierter Phytoremediation-Studien (Aduse-Poku 2024/2025, Pugh et al.).',
      'Ästhetik / Aufenthaltsqualität: qualitative Einschätzung, kein Immobilienwert.'
    ],
    scored_en: [
      'Biodiversity: score based on substrate depth, species diversity, flowering share, and maintenance practices.',
      'Air quality: assessment based on published phytoremediation studies (Aduse-Poku 2024/2025, Pugh et al.).',
      'Aesthetics / amenity: qualitative assessment, not a property valuation.'
    ],
    not_included_de: [
      'HVAC-Investitionsersparnisse (projektspezifisch, nicht pauschal quantifizierbar)',
      'Wertsteigernder Immobilieneffekt (kein belastbarer Marktnachweis auf Objektebene)',
      'Soziale Kosten des CO₂-Ausstoßes / Klimafolgekosten (externen Kosten)',
      'Biodiversitäts-Ausgleichszahlungen oder Ökopunkte (projektspezifisch)',
      'Personalkosten der Instandhaltung (separat zu kalkulieren)',
      'Baugenehmigungskosten, Statikgutachten und Planungskosten (projektspezifisch)'
    ],
    not_included_en: [
      'HVAC capital cost savings (project-specific, not generalisable)',
      'Property value uplift (no reliable evidence at individual asset level)',
      'Social cost of carbon / climate damage costs (external costs)',
      'Biodiversity offset credits or eco-points (project-specific)',
      'Maintenance labour costs (to be calculated separately)',
      'Building permit costs, structural surveys and planning fees (project-specific)'
    ],
    expert_review_de: 'Alle hier dargestellten Werte sind indikative Ersteinschätzungen auf Basis typischer Marktdaten und Literaturwerte. Sie stellen keine Wirtschaftlichkeitsgarantie dar und ersetzen keine individuelle Projektbewertung. KGSK empfiehlt für verbindliche Entscheidungen eine fundierte Fachplanung und ein projektspezifisches Förder-Screening.',
    expert_review_en: 'All values presented here are indicative first assessments based on typical market data and literature benchmarks. They do not constitute a guarantee of financial return and do not replace individual project assessment. KGSK recommends specialist planning and a project-specific funding screening for binding decisions.'
  };

  /* ---------------------------------------------------------------------------
     EXPORT
     ------------------------------------------------------------------------- */

  var KGSK_BENEFITS = {
    calcRoofLifespan:    calcRoofLifespan,
    calcStormwater:      calcStormwater,
    calcEnergy:          calcEnergy,
    scoreBiodiversity:   scoreBiodiversity,
    scoreAirQuality:     scoreAirQuality,
    scoreAesthetics:     scoreAesthetics,
    buildReport:         buildReport,
    recommendNextStep:   recommendNextStep,
    methodology:         methodology
  };

  global.KGSK_BENEFITS = KGSK_BENEFITS;

}(typeof window !== 'undefined' ? window : this));
