/* KGSK Lead Scoring Module — v2.0 */
/* ES5 compatible, no imports */

window.KGSK_SCORING = {

  score: function(state, lead) {
    var score = 0;

    // Actor
    if (state.actor === 'bauherr' || state.actor === 'kommune') {
      score += 20;
    } else if (state.actor === 'architekt') {
      score += 15;
    } else if (state.actor === 'hersteller') {
      score += 5;
    }

    // Size
    if (state.size === 'gross') {
      score += 20;
    } else if (state.size === 'mittel') {
      score += 12;
    } else if (state.size === 'klein') {
      score += 5;
    }

    // Land specificity
    if (state.land && state.land !== 'all') {
      score += 5;
    }

    // Timeline
    if (state.timeline === 'now' || state.timeline === '6m') {
      score += 15;
    } else if (state.timeline === '1y') {
      score += 8;
    }

    // Budget
    if (state.budget !== 'unknown' && state.budget !== undefined && state.budget !== null && state.budget !== '') {
      score += 10;
      if (state.budget === 'over500' || state.budget === '200_500') {
        score += 10;
      }
    }

    // Phone
    if (lead.phone && lead.phone !== '') {
      score += 5;
    }

    // Interest
    if (lead.interest === 'yes' || lead.interest === 'screening') {
      score += 15;
      if (lead.interest === 'yes') {
        score += 5;
      }
    }

    // Cap at 100
    if (score > 100) { score = 100; }

    // Tier and labels
    var tier, label_de, label_en, next_action_de, next_action_en;

    if (score >= 65) {
      tier = 'high';
      label_de = 'Hohes Projektinteresse';
      label_en = 'High Project Interest';
      next_action_de = 'Direkter Projektanruf + detailliertes Förder-Screening anbieten';
      next_action_en = 'Direct project call + offer detailed funding screening';
    } else if (score >= 35) {
      tier = 'medium';
      label_de = 'Konkretes Interesse';
      label_en = 'Concrete Interest';
      next_action_de = 'Kostenloses Erstgespräch anbieten';
      next_action_en = 'Offer a free initial consultation';
    } else {
      tier = 'low';
      label_de = 'Informationsanfrage';
      label_en = 'Information Request';
      next_action_de = 'Zusammenfassung zusenden + Newsletter-Einladung';
      next_action_en = 'Send summary + newsletter invitation';
    }

    return {
      score: score,
      tier: tier,
      label_de: label_de,
      label_en: label_en,
      next_action_de: next_action_de,
      next_action_en: next_action_en
    };
  },

  buildPayload: function(state, lead, matched_programmes, lang) {
    var scoring = this.score(state, lead);
    var score = scoring.score;
    var tier = scoring.tier;
    var label_de = scoring.label_de;
    var label_en = scoring.label_en;
    var next_action_de = scoring.next_action_de;
    var next_action_en = scoring.next_action_en;

    // Urgency
    var urgency;
    if (state.timeline === 'now') {
      urgency = 'immediate';
    } else if (state.timeline === '6m') {
      urgency = 'soon';
    } else if (state.timeline === '1y') {
      urgency = 'medium';
    } else {
      urgency = 'low';
    }

    return {
      meta: {
        submitted_at: new Date().toISOString(),
        tool_version: '2.0',
        source: 'kgsk-tools-foerdercheck',
        lang: lang
      },
      contact: {
        name: lead.name,
        email: lead.email,
        phone: lead.phone || null,
        organisation: lead.org || null,
        consent: lead.consent,
        interest: lead.interest
      },
      project: {
        actor: state.actor,
        project_type: state.project,
        building_type: state.building,
        bundesland: state.land,
        size: state.size,
        timeline: state.timeline || null,
        budget: state.budget || null
      },
      results: {
        matched_programme_ids: matched_programmes.map(function(p) { return p.id; }),
        matched_count: matched_programmes.length,
        potential_range: ''
      },
      scoring: {
        score: score,
        tier: tier,
        label_de: label_de,
        label_en: label_en,
        next_action_de: next_action_de,
        next_action_en: next_action_en,
        urgency: urgency
      },
      recommended_action: next_action_de
    };
  }

};
