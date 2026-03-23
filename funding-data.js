/* ==========================================================================
   KGSK Lead Funnel Tool — Funding Programme Database
   funding-data.js — 13 programmes, matching logic, potential range helper
   ========================================================================== */

window.FUNDING_DATA = {

  programmes: [

    /* ------------------------------------------------------------------
       1. BEG – Bundesförderung Effizienter Gebäude (Einzelmaßnahmen)
       Funder: BAFA / KfW
    ------------------------------------------------------------------ */
    {
      id: 'beg_einzelmassnahmen',
      name_de: 'BEG – Bundesförderung Effizienter Gebäude (Einzelmaßnahmen)',
      name_en: 'BEG – Federal Funding for Efficient Buildings (Individual Measures)',
      short_desc_de: 'Zuschüsse des BAFA für einzelne energetische Sanierungsmaßnahmen, einschließlich Dach- und Fassadenbegrünung als Teil der Gebäudehülle.',
      short_desc_en: 'BAFA grants for individual energy-efficiency refurbishment measures, including green roofs and facades as part of the building envelope.',
      match_why_de: 'Ihr Gebäudetyp und Ihre Maßnahmenkombination sind typischerweise förderfähig unter der BEG-Einzelmaßnahmenförderung des BAFA.',
      match_why_en: 'Your building type and combination of measures are typically eligible under the BAFA BEG individual measure programme.',
      source_url: 'https://www.bafa.de/DE/Energie/Effiziente_Gebaeude/Einzelmassnahmen/einzelmassnahmen_node.html',
      source_label_de: 'Offizielle Quelle ansehen',
      source_label_en: 'View official source',
      source_type: 'official_page',
      source_de_only: true,
      region: 'bundesweit',
      level: 'federal',
      badge_de: 'Bundesweit · BAFA',
      badge_en: 'Nationwide · BAFA',
      actors: ['bauherr', 'architekt'],
      project_types: ['dach', 'fassade', 'kombiniert', 'regenwasser'],
      building_types: ['bestand', 'neubau'],
      sizes: [],
      bundeslaender: [],
      indicative_only: true,
      last_checked: '2025-01',
      amount_de: 'bis zu 20% Zuschuss (Sanierung); Kombination mit anderen Programmen möglich',
      amount_en: 'up to 20% grant (refurbishment); combination with other programmes possible',
      eligibility_notes_de: 'Antrag muss vor Baubeginn gestellt werden. Nachweis über Energieeinsparung erforderlich. Fachunternehmerbestätigung notwendig.',
      eligibility_notes_en: 'Application must be submitted before construction begins. Proof of energy savings required. Confirmation by a qualified contractor necessary.'
    },

    /* ------------------------------------------------------------------
       2. KfW Klimafreundlicher Neubau (KfW 297/298)
    ------------------------------------------------------------------ */
    {
      id: 'kfw_297_298',
      name_de: 'KfW Klimafreundlicher Neubau (KfW 297/298)',
      name_en: 'KfW Climate-Friendly New Construction (KfW 297/298)',
      short_desc_de: 'Zinsgünstige KfW-Kredite für klimafreundliche Neubauten, die besonders hohe Energieeffizienz- und Nachhaltigkeitsstandards erfüllen.',
      short_desc_en: 'Low-interest KfW loans for climate-friendly new buildings meeting particularly high energy efficiency and sustainability standards.',
      match_why_de: 'Ihr Neubauvorhaben mit Dachbegrünung kann als Teil eines klimafreundlichen Gebäudekonzepts über das KfW-Programm 297/298 gefördert werden.',
      match_why_en: 'Your new construction project with green roof can be funded as part of a climate-friendly building concept under KfW programme 297/298.',
      source_url: 'https://www.kfw.de/inlandsfoerderung/Privatpersonen/Neubau/F%C3%B6rderprodukte/Klimafreundlicher-Neubau-(297-298)/',
      source_label_de: 'Programmseite ansehen',
      source_label_en: 'View programme page',
      source_type: 'programme_page',
      source_de_only: false,
      region: 'bundesweit',
      level: 'federal',
      badge_de: 'Bundesweit · KfW',
      badge_en: 'Nationwide · KfW',
      actors: ['bauherr', 'architekt'],
      project_types: ['dach', 'kombiniert'],
      building_types: ['neubau'],
      sizes: ['klein', 'mittel', 'gross'],
      bundeslaender: [],
      indicative_only: true,
      last_checked: '2025-01',
      amount_de: 'zinsgünstiger Kredit bis 150.000 € pro Wohneinheit; Tilgungszuschuss bis 5%',
      amount_en: 'low-interest loan up to €150,000 per residential unit; repayment grant up to 5%',
      eligibility_notes_de: 'Gebäude muss mindestens Effizienzhaus 40 NH erreichen. Zertifizierung nach Qualitätssiegel Nachhaltiges Gebäude (QNG) erforderlich für Tilgungszuschuss.',
      eligibility_notes_en: 'Building must achieve at minimum Efficiency House 40 NH. QNG sustainability certification required for repayment grant.'
    },

    /* ------------------------------------------------------------------
       3. Klimaanpassung in sozialen Einrichtungen (BMWSB)
    ------------------------------------------------------------------ */
    {
      id: 'klimaanpassung_soziale',
      name_de: 'Klimaanpassung in sozialen Einrichtungen (BMWSB)',
      name_en: 'Climate Adaptation in Social Facilities (BMWSB)',
      short_desc_de: 'Bundesförderprogramm für Hitzeschutz und Klimaanpassungsmaßnahmen in Kitas, Schulen, Pflegeeinrichtungen und ähnlichen sozialen Einrichtungen.',
      short_desc_en: 'Federal funding programme for heat protection and climate adaptation measures in nurseries, schools, care facilities and similar social institutions.',
      match_why_de: 'Soziale Einrichtungen und Kommunen erhalten über dieses Bundesprogramm besonders hohe Förderquoten für Begrünung als Hitzeschutzmaßnahme.',
      match_why_en: 'Social institutions and municipalities receive particularly high funding rates through this federal programme for greening as a heat protection measure.',
      source_url: 'https://www.bundesregierung.de/breg-de/aktuelles/klimaanpassung-soziale-einrichtungen-2196110',
      source_label_de: 'Offizielle Quelle ansehen',
      source_label_en: 'View official source',
      source_type: 'official_page',
      source_de_only: true,
      region: 'bundesweit',
      level: 'federal',
      badge_de: 'Bundesweit · BMWSB',
      badge_en: 'Nationwide · BMWSB',
      actors: ['bauherr', 'kommune'],
      project_types: ['dach', 'fassade', 'kombiniert', 'regenwasser'],
      building_types: ['sozial', 'oeffentlich'],
      sizes: [],
      bundeslaender: [],
      indicative_only: true,
      last_checked: '2025-01',
      amount_de: 'bis zu 80% Förderquote für Kommunen und soziale Träger',
      amount_en: 'up to 80% funding rate for municipalities and social institutions',
      eligibility_notes_de: 'Antragsberechtigt sind Kommunen, gemeinnützige Träger und anerkannte soziale Einrichtungen. Förderschwerpunkt ist Hitzeschutz und Resilienz.',
      eligibility_notes_en: 'Eligible applicants are municipalities, non-profit organisations and recognised social institutions. Funding focus is heat protection and resilience.'
    },

    /* ------------------------------------------------------------------
       4. Bundesförderprogramm Stadtgrün (BBSR)
    ------------------------------------------------------------------ */
    {
      id: 'bbsr_stadtgruen',
      name_de: 'Bundesförderprogramm Stadtgrün (BBSR)',
      name_en: 'Federal Urban Green Programme (BBSR)',
      short_desc_de: 'Modellhafte Projekte zur Entwicklung und Aufwertung städtischer Grünflächen, einschließlich gebäudebezogener Begrünung in kommunalem Kontext.',
      short_desc_en: 'Model projects for the development and enhancement of urban green spaces, including building-related greening in a municipal context.',
      match_why_de: 'Kommunale Gebäudebegrünungen mit Vorbildcharakter sind typischerweise förderfähig im Rahmen des BBSR-Bundesförderprogramms Stadtgrün.',
      match_why_en: 'Municipal building greening projects with model character are typically eligible under the BBSR Federal Urban Green Programme.',
      source_url: 'https://www.bbsr.bund.de/BBSR/DE/forschung/programme/stadtgruen/stadtgruen_node.html',
      source_label_de: 'Programmseite ansehen',
      source_label_en: 'View programme page',
      source_type: 'programme_page',
      source_de_only: true,
      region: 'bundesweit',
      level: 'federal',
      badge_de: 'Bundesweit · BBSR',
      badge_en: 'Nationwide · BBSR',
      actors: ['kommune'],
      project_types: ['dach', 'fassade', 'kombiniert', 'regenwasser'],
      building_types: ['oeffentlich', 'sozial'],
      sizes: ['mittel', 'gross'],
      bundeslaender: [],
      indicative_only: true,
      last_checked: '2025-01',
      amount_de: 'bis zu 75% der förderfähigen Kosten',
      amount_en: 'up to 75% of eligible costs',
      eligibility_notes_de: 'Förderung erfolgt im Wettbewerbsverfahren. Modellhafte und übertragbare Ansätze werden bevorzugt. Kommunen reichen Projektskizzen ein.',
      eligibility_notes_en: 'Funding is awarded through a competitive process. Model and transferable approaches are preferred. Municipalities submit project outlines.'
    },

    /* ------------------------------------------------------------------
       5. progres.nrw – Klimaanpassung (NRW)
    ------------------------------------------------------------------ */
    {
      id: 'progres_nrw',
      name_de: 'progres.nrw – Klimaanpassung',
      name_en: 'progres.nrw – Climate Adaptation',
      short_desc_de: 'NRW-Landesprogramm für Klimaanpassungsmaßnahmen an Gebäuden, darunter Dach- und Fassadenbegrünung als anerkannte Maßnahmen.',
      short_desc_en: 'NRW state programme for climate adaptation measures on buildings, including green roofs and facade greening as recognised measures.',
      match_why_de: 'Für Projekte in Nordrhein-Westfalen bietet progres.nrw einen direkten Zuschuss auf Begrünungsmaßnahmen an Gebäuden.',
      match_why_en: 'For projects in North Rhine-Westphalia, progres.nrw provides a direct grant for building greening measures.',
      source_url: 'https://www.energieagentur.nrw/progres-nrw',
      source_label_de: 'Programmseite ansehen',
      source_label_en: 'View programme page',
      source_type: 'programme_page',
      source_de_only: true,
      region: 'nrw',
      level: 'state',
      badge_de: 'NRW · Landesförderung',
      badge_en: 'NRW · State funding',
      actors: ['bauherr', 'architekt'],
      project_types: ['dach', 'fassade', 'kombiniert'],
      building_types: ['bestand', 'neubau'],
      sizes: ['mittel', 'gross'],
      bundeslaender: ['nrw'],
      indicative_only: true,
      last_checked: '2025-01',
      amount_de: 'bis zu 30% Zuschuss auf Begrünungsmaßnahmen',
      amount_en: 'up to 30% grant on greening measures',
      eligibility_notes_de: 'Antragstellung über die Energie-Agentur NRW. Maßnahme muss den technischen Mindestanforderungen genügen. Kombination mit BEG möglich.',
      eligibility_notes_en: 'Application via Energy Agency NRW. Measure must meet minimum technical requirements. Combination with BEG possible.'
    },

    /* ------------------------------------------------------------------
       6. Klimaangepasstes Stadtgrün NRW (Kommunalrichtlinie)
    ------------------------------------------------------------------ */
    {
      id: 'nrw_kommunalrichtlinie',
      name_de: 'Klimaangepasstes Stadtgrün NRW (Kommunalrichtlinie)',
      name_en: 'Climate-Adapted Urban Green NRW (Municipal Guideline)',
      short_desc_de: 'NRW-Förderprogramm für Kommunen zur Entwicklung klimaangepasster Stadtgrünstrukturen, inklusive Gebäudebegrünung und Regenwassermanagement.',
      short_desc_en: 'NRW funding programme for municipalities developing climate-adapted urban green structures, including building greening and rainwater management.',
      match_why_de: 'Als Kommunalprojekt in NRW kann Ihre Begrünungsmaßnahme unter der Kommunalrichtlinie mit besonders hohen Förderquoten bezuschusst werden.',
      match_why_en: 'As a municipal project in NRW, your greening measure can be subsidised under the municipal guideline with particularly high funding rates.',
      source_url: 'https://www.umwelt.nrw.de/umwelt/klimawandel-und-klimaschutz/klimaanpassung/foerderung',
      source_label_de: 'Förderrichtlinie ansehen',
      source_label_en: 'View funding guideline',
      source_type: 'guideline',
      source_de_only: true,
      region: 'nrw',
      level: 'state',
      badge_de: 'NRW · Kommunal',
      badge_en: 'NRW · Municipal',
      actors: ['kommune'],
      project_types: ['dach', 'fassade', 'kombiniert', 'regenwasser'],
      building_types: ['oeffentlich', 'sozial', 'neubau', 'bestand'],
      sizes: ['mittel', 'gross'],
      bundeslaender: ['nrw'],
      indicative_only: true,
      last_checked: '2025-01',
      amount_de: 'bis zu 75% für Kommunen; Mindestprojektgröße 100 m²',
      amount_en: 'up to 75% for municipalities; minimum project size 100 m²',
      eligibility_notes_de: 'Antragsberechtigt sind Kommunen und kommunale Einrichtungen in NRW. Mindestfläche 100 m². Bewilligungsbehörde: Bezirksregierung.',
      eligibility_notes_en: 'Eligible applicants are municipalities and municipal bodies in NRW. Minimum area 100 m². Approving authority: District Government.'
    },

    /* ------------------------------------------------------------------
       7. Hamburger Gründachstrategie / Gründachförderung
    ------------------------------------------------------------------ */
    {
      id: 'hamburg_gruendach',
      name_de: 'Hamburger Gründachstrategie / Gründachförderung',
      name_en: 'Hamburg Green Roof Strategy / Green Roof Funding',
      short_desc_de: 'Hamburger Förderprogramm für Gründächer als Teil der Klimaschutzstrategie; Zuschüsse je Quadratmeter für Neubau und Bestand.',
      short_desc_en: 'Hamburg funding programme for green roofs as part of the climate protection strategy; grants per square metre for new build and existing buildings.',
      match_why_de: 'Für Projekte in Hamburg bietet die Gründachstrategie direkten Flächenzuschuss, der besonders für Dächer attraktiv ist.',
      match_why_en: 'For projects in Hamburg, the green roof strategy offers direct area-based grants that are particularly attractive for roofs.',
      source_url: 'https://www.hamburg.de/klimaschutzprogramm/',
      source_label_de: 'Programmseite ansehen',
      source_label_en: 'View programme page',
      source_type: 'programme_page',
      source_de_only: true,
      region: 'hamburg',
      level: 'state',
      badge_de: 'Hamburg · Landesförderung',
      badge_en: 'Hamburg · State funding',
      actors: ['bauherr', 'architekt'],
      project_types: ['dach', 'kombiniert'],
      building_types: ['neubau', 'bestand'],
      sizes: ['klein', 'mittel', 'gross'],
      bundeslaender: ['ham'],
      indicative_only: true,
      last_checked: '2025-01',
      amount_de: '30–60 €/m² Zuschuss; max. 100.000 € pro Vorhaben',
      amount_en: '€30–60/m² grant; max. €100,000 per project',
      eligibility_notes_de: 'Förderung über die Hamburgische Investitions- und Förderbank (IFB). Mindestdachfläche und Substrataufbau gemäß Richtlinie. Antrag vor Baubeginn.',
      eligibility_notes_en: 'Funding via Hamburg Investment and Promotion Bank (IFB). Minimum roof area and substrate build-up per guidelines. Application before construction.'
    },

    /* ------------------------------------------------------------------
       8. Berliner Dach- und Fassadenbegrünung (IBB / SenUMVK)
    ------------------------------------------------------------------ */
    {
      id: 'berlin_ibb',
      name_de: 'Berliner Dach- und Fassadenbegrünung (IBB / SenUMVK)',
      name_en: 'Berlin Green Roofs and Facades (IBB / SenUMVK)',
      short_desc_de: 'Berliner Förderprogramm über die IBB und die Senatsverwaltung für Umwelt für Dach- und Fassadenbegrünungen als Klimaanpassungsmaßnahmen.',
      short_desc_en: 'Berlin funding programme via IBB and the Senate Department for the Environment for green roofs and facades as climate adaptation measures.',
      match_why_de: 'Für Berliner Projekte bietet das IBB-Programm sowohl Zuschüsse als auch zinsgünstige Darlehen für Dach- und Fassadenbegrünungen.',
      match_why_en: 'For Berlin projects, the IBB programme offers both grants and low-interest loans for green roofs and facade greening.',
      source_url: 'https://www.ibb.de/de/foerderprogramme/berliner-programm-fuer-nachhaltige-entwicklung.html',
      source_label_de: 'Programmseite ansehen',
      source_label_en: 'View programme page',
      source_type: 'programme_page',
      source_de_only: true,
      region: 'berlin',
      level: 'state',
      badge_de: 'Berlin · IBB',
      badge_en: 'Berlin · IBB',
      actors: ['bauherr', 'architekt'],
      project_types: ['dach', 'fassade', 'kombiniert'],
      building_types: ['neubau', 'bestand'],
      sizes: ['klein', 'mittel', 'gross'],
      bundeslaender: ['ber'],
      indicative_only: true,
      last_checked: '2025-01',
      amount_de: 'Zuschüsse und zinsgünstige Darlehen; projektspezifisch',
      amount_en: 'Grants and low-interest loans; project-specific',
      eligibility_notes_de: 'Förderhöhe und Konditionen werden projektspezifisch festgelegt. Beratung durch IBB-Förderlotsen empfohlen.',
      eligibility_notes_en: 'Funding amounts and conditions are determined on a project-specific basis. Consultation with IBB funding advisors recommended.'
    },

    /* ------------------------------------------------------------------
       9. BayKlimaF – Bayerisches Förderprogramm Klimaanpassung
    ------------------------------------------------------------------ */
    {
      id: 'bayklimaf',
      name_de: 'BayKlimaF – Bayerisches Förderprogramm Klimaanpassung',
      name_en: 'BayKlimaF – Bavarian Climate Adaptation Funding Programme',
      short_desc_de: 'Bayerisches Förderprogramm für Klimaanpassungsmaßnahmen an Gebäuden und im Freiraum, einschließlich Dach- und Fassadenbegrünung.',
      short_desc_en: 'Bavarian funding programme for climate adaptation measures on buildings and in open spaces, including green roofs and facade greening.',
      match_why_de: 'Für Projekte in Bayern bietet BayKlimaF attraktive Förderquoten für Begrünungsmaßnahmen, mit erhöhten Sätzen für Kommunen.',
      match_why_en: 'For projects in Bavaria, BayKlimaF offers attractive funding rates for greening measures, with enhanced rates for municipalities.',
      source_url: 'https://www.stmuv.bayern.de/themen/klimaschutz/klimaanpassung/foerderung/index.htm',
      source_label_de: 'Offizielle Quelle ansehen',
      source_label_en: 'View official source',
      source_type: 'official_page',
      source_de_only: true,
      region: 'bayern',
      level: 'state',
      badge_de: 'Bayern · StMUV',
      badge_en: 'Bavaria · StMUV',
      actors: ['bauherr', 'architekt', 'kommune'],
      project_types: ['dach', 'fassade', 'kombiniert', 'regenwasser'],
      building_types: ['neubau', 'bestand', 'oeffentlich', 'sozial'],
      sizes: ['klein', 'mittel', 'gross'],
      bundeslaender: ['bay'],
      indicative_only: true,
      last_checked: '2025-01',
      amount_de: 'bis zu 50% Förderquote; Kommunen bis zu 70%',
      amount_en: 'up to 50% funding rate; municipalities up to 70%',
      eligibility_notes_de: 'Antragstellung über die Regierung von Oberbayern als Bewilligungsbehörde. Mindestinvestitionsvolumen und technische Mindestanforderungen gemäß Richtlinie.',
      eligibility_notes_en: 'Applications submitted to the Government of Upper Bavaria as the approving authority. Minimum investment volume and technical requirements per guidelines.'
    },

    /* ------------------------------------------------------------------
       10. Niederschlagswassergebühr-Reduktion (kommunal)
    ------------------------------------------------------------------ */
    {
      id: 'niederschlagswasser_gebuehr',
      name_de: 'Niederschlagswassergebühr-Reduktion (kommunal)',
      name_en: 'Rainwater Fee Reduction (Municipal)',
      short_desc_de: 'Dauerhafter finanzieller Vorteil durch reduzierte oder erlassene Niederschlagswassergebühren bei Dachbegrünung und Versickerungsanlagen.',
      short_desc_en: 'Permanent financial benefit through reduced or waived rainwater fees for green roofs and infiltration systems.',
      match_why_de: 'Begrünte Dachflächen werden in vielen Kommunen bei der Niederschlagswassergebühr begünstigt — ein dauerhafter wirtschaftlicher Vorteil.',
      match_why_en: 'Green roof areas receive preferential rainwater fee treatment in many municipalities — a lasting economic benefit.',
      source_url: 'https://www.umweltbundesamt.de/themen/wasser/wasser-bewirtschaften/regenwasserbewirtschaftung',
      source_label_de: 'Offizielle Quelle ansehen',
      source_label_en: 'View official source',
      source_type: 'official_page',
      source_de_only: true,
      region: 'bundesweit',
      level: 'municipal',
      badge_de: 'Kommunal · variiert',
      badge_en: 'Municipal · varies',
      actors: ['bauherr', 'architekt', 'kommune'],
      project_types: ['dach', 'kombiniert', 'regenwasser'],
      building_types: ['neubau', 'bestand', 'oeffentlich', 'sozial'],
      sizes: ['klein', 'mittel', 'gross'],
      bundeslaender: [],
      indicative_only: true,
      last_checked: '2025-01',
      amount_de: 'dauerhafter Gebührenvorteil; je nach Gemeinde 0,50–3,00 €/m²/Jahr',
      amount_en: 'permanent fee benefit; depending on municipality €0.50–3.00/m²/year',
      eligibility_notes_de: 'Konditionen variieren stark je Gemeinde. Nachweis der angeschlossenen Fläche und des Begrünungsaufbaus erforderlich. Bei zuständigem Abwasserbetrieb erfragen.',
      eligibility_notes_en: 'Conditions vary significantly by municipality. Proof of connected area and greening structure required. Enquire with the local wastewater authority.'
    },

    /* ------------------------------------------------------------------
       11. Städtische Förderprogramme (Lokale Zuschüsse)
    ------------------------------------------------------------------ */
    {
      id: 'staedte_lokal',
      name_de: 'Städtische Förderprogramme (Lokale Zuschüsse)',
      name_en: 'Municipal Funding Programmes (Local Grants)',
      short_desc_de: 'Zahlreiche Städte und Gemeinden bieten eigene lokale Förderprogramme für Dach- und Fassadenbegrünung an, unabhängig von Landes- und Bundesprogrammen.',
      short_desc_en: 'Many cities and municipalities offer their own local funding programmes for green roofs and facade greening, independent of state and federal programmes.',
      match_why_de: 'Viele Städte haben eigene Begrünungsförderprogramme — eine Recherche beim lokalen Umwelt- oder Stadtplanungsamt lohnt sich für Ihr Projekt.',
      match_why_en: 'Many cities have their own greening funding programmes — checking with the local environment or urban planning office is worthwhile for your project.',
      source_url: 'https://www.staedtebaufoerderung.info/',
      source_label_de: 'Programmseite ansehen',
      source_label_en: 'View programme page',
      source_type: 'programme_page',
      source_de_only: true,
      region: 'bundesweit',
      level: 'municipal',
      badge_de: 'Kommunal · lokal',
      badge_en: 'Municipal · local',
      actors: ['bauherr', 'architekt', 'kommune'],
      project_types: ['dach', 'fassade', 'kombiniert'],
      building_types: ['neubau', 'bestand'],
      sizes: ['klein', 'mittel', 'gross'],
      bundeslaender: [],
      indicative_only: true,
      last_checked: '2025-01',
      amount_de: 'variiert stark; typisch 20–50% oder Festbetrag je m²',
      amount_en: 'varies widely; typically 20–50% or fixed amount per m²',
      eligibility_notes_de: 'Verfügbarkeit, Höhe und Konditionen variieren je Gemeinde erheblich. Direkte Anfrage bei der zuständigen Behörde notwendig.',
      eligibility_notes_en: 'Availability, amounts and conditions vary considerably by municipality. Direct enquiry with the relevant authority necessary.'
    },

    /* ------------------------------------------------------------------
       12. Steuerliche Absetzbarkeit (§ 35c EStG / Betriebsausgaben)
    ------------------------------------------------------------------ */
    {
      id: 'steuer_35c_estg',
      name_de: 'Steuerliche Absetzbarkeit (§ 35c EStG / Betriebsausgaben)',
      name_en: 'Tax Deductibility (§ 35c EStG / Business Expenses)',
      short_desc_de: 'Steuerliche Förderung energetischer Sanierungsmaßnahmen am selbstgenutzten Eigenheim gemäß § 35c EStG; gewerbliche Nutzung als Betriebsausgabe absetzbar.',
      short_desc_en: 'Tax incentive for energy-efficiency refurbishment measures on owner-occupied homes under § 35c EStG; commercial use deductible as business expense.',
      match_why_de: 'Gebäudebegrünung als Teil einer energetischen Sanierung kann steuerlich über § 35c EStG geltend gemacht werden — kumulierbar mit Zuschüssen.',
      match_why_en: 'Building greening as part of an energy refurbishment can be claimed under § 35c EStG — combinable with grants.',
      source_url: 'https://www.bundesfinanzministerium.de/Web/DE/Themen/Steuern/Steuerarten/Einkommensteuer/einkommensteuer.html',
      source_label_de: 'Offizielle Quelle ansehen',
      source_label_en: 'View official source',
      source_type: 'official_page',
      source_de_only: true,
      region: 'bundesweit',
      level: 'tax',
      badge_de: 'Bundesweit · Steuer',
      badge_en: 'Nationwide · Tax',
      actors: ['bauherr'],
      project_types: ['dach', 'fassade', 'kombiniert'],
      building_types: ['bestand'],
      sizes: ['klein', 'mittel'],
      bundeslaender: [],
      indicative_only: true,
      last_checked: '2025-01',
      amount_de: 'bis zu 20% der Maßnahmenkosten (max. 40.000 € über 3 Jahre) für Privateigentümer',
      amount_en: 'up to 20% of measure costs (max. €40,000 over 3 years) for private owners',
      eligibility_notes_de: 'Nur für selbstgenutztes Wohneigentum. Nicht kombinierbar mit direkten Förderzuschüssen für dieselbe Maßnahme. Steuerberater konsultieren.',
      eligibility_notes_en: 'Only for owner-occupied residential property. Cannot be combined with direct grants for the same measure. Consult a tax adviser.'
    },

    /* ------------------------------------------------------------------
       13. Bundesprogramm Innovative Stadtentwicklung / Forschungsförderung
    ------------------------------------------------------------------ */
    {
      id: 'bmwsb_stadtentwicklung',
      name_de: 'Bundesprogramm Innovative Stadtentwicklung / Forschungsförderung',
      name_en: 'Federal Programme for Innovative Urban Development / Research Funding',
      short_desc_de: 'Bundesförderung für modellhafte und innovative Stadtentwicklungsprojekte sowie angewandte Forschung im Bereich Stadtgrün und Klimaanpassung.',
      short_desc_en: 'Federal funding for model and innovative urban development projects and applied research in urban greening and climate adaptation.',
      match_why_de: 'Innovative großskalige Begrünungsvorhaben in kommunalem oder Forschungskontext können als Modellprojekte über das BMWSB-Programm gefördert werden.',
      match_why_en: 'Innovative large-scale greening projects in a municipal or research context can be funded as model projects through the BMWSB programme.',
      source_url: 'https://www.bmwsb.bund.de/Webs/BMWSB/DE/themen/stadtentwicklung/staedtebaufoerderung/staedtebaufoerderung-node.html',
      source_label_de: 'Programmseite ansehen',
      source_label_en: 'View programme page',
      source_type: 'programme_page',
      source_de_only: true,
      region: 'bundesweit',
      level: 'federal',
      badge_de: 'Bundesweit · BMWSB',
      badge_en: 'Nationwide · BMWSB',
      actors: ['hersteller', 'kommune'],
      project_types: ['dach', 'fassade', 'kombiniert', 'regenwasser'],
      building_types: ['oeffentlich', 'sozial'],
      sizes: ['gross'],
      bundeslaender: [],
      indicative_only: true,
      last_checked: '2025-01',
      amount_de: 'projektabhängig; typisch 50–80% für Modellvorhaben',
      amount_en: 'project-dependent; typically 50–80% for model projects',
      eligibility_notes_de: 'Vergabe im Wettbewerbs- oder Auswahlverfahren. Voraussetzung: Modellcharakter, Übertragbarkeit, wissenschaftliche Begleitung empfohlen.',
      eligibility_notes_en: 'Awarded through competitive or selection process. Requirements: model character, transferability, scientific monitoring recommended.'
    }

  ], // end programmes

  /* ------------------------------------------------------------------
     Matching function
     state: { actor, project, building, size, land }
  ------------------------------------------------------------------ */
  match: function (state) {
    return window.FUNDING_DATA.programmes.filter(function (p) {
      var actorOk    = !p.actors.length         || p.actors.indexOf(state.actor) !== -1;
      var projectOk  = !p.project_types.length  || p.project_types.indexOf(state.project) !== -1;
      var buildingOk = !p.building_types.length || p.building_types.indexOf(state.building) !== -1;
      var sizeOk     = !p.sizes.length          || p.sizes.indexOf(state.size) !== -1;
      var landOk     = !p.bundeslaender.length  || p.bundeslaender.indexOf(state.land) !== -1;
      return actorOk && projectOk && buildingOk && sizeOk && landOk;
    });
  },

  /* ------------------------------------------------------------------
     Indicative funding range string
     matched: Array of matched programme objects
     size: 'klein' | 'mittel' | 'gross'
     Returns e.g. "20000 – 80000 €"
  ------------------------------------------------------------------ */
  potentialRange: function (matched, size) {
    var base = size === 'gross' ? 200000 : size === 'mittel' ? 80000 : 20000;
    var multiplier = Math.min(matched.length, 4);
    var low  = base * 0.3 * multiplier;
    var high = base * multiplier;
    var lo = Math.round(low  / 1000) * 1000;
    var hi = Math.round(high / 1000) * 1000;
    return lo.toLocaleString('de-DE') + ' – ' + hi.toLocaleString('de-DE') + ' €';
  }

};
