const PROVINCES = [
  "Bas-Uélé",
  "Équateur",
  "Haut-Katanga",
  "Haut-Lomami",
  "Haut-Uélé",
  "Ituri",
  "Kasaï",
  "Kasaï-Central",
  "Kasaï-Oriental",
  "Kinshasa",
  "Kongo-Central",
  "Kwango",
  "Kwilu",
  "Lomami",
  "Lualaba",
  "Mai-Ndombe",
  "Maniema",
  "Mongala",
  "Nord-Kivu",
  "Nord-Ubangi",
  "Sankuru",
  "Sud-Kivu",
  "Sud-Ubangi",
  "Tanganyika",
  "Tshopo",
  "Tshuapa"
];

const MOIS_LISTE = [
  "JANVIER", "FÉVRIER", "MARS", "AVRIL", "MAI", "JUIN",
  "JUILLET", "AOÛT", "SEPTEMBRE", "OCTOBRE", "NOVEMBRE", "DÉCEMBRE"
];

const TYPES_ENTITE = [
  "Johrei Center",
  "Zone",
  "Groupe",
  "Cellule",
  "Antenne",
  "Autre"
];

const SCHEMAS = {
  entites: {
    title: "Répertoire d'Entité",
    fields: [
      { key: "province", label: "Province", type: "select", options: PROVINCES, required: true, group: "Localisation" },
      { key: "typeEntite", label: "Type d'entité", type: "select", options: TYPES_ENTITE, required: true, group: "Localisation" },
      { key: "denomination", label: "Dénomination de l'entité", type: "text", required: true, group: "Identification" },
      { key: "responsable", label: "Responsable", type: "text", required: true, group: "Identification" },
      { key: "telephone", label: "Téléphone", type: "text", group: "Contact" },
      { key: "observations", label: "Observations", type: "textarea", group: "Notes" }
    ]
  },
  numerique: {
    title: "Rapport Numérique",
    fields: [
      { key: "dateRapport", label: "Date du rapport", type: "date", required: true, group: "Période & Localisation" },
      { key: "province", label: "Province", type: "select", options: PROVINCES, required: true, group: "Période & Localisation" },
      { key: "typeEntite", label: "Type d'entité", type: "select", options: TYPES_ENTITE, required: true, group: "Période & Localisation" },
      { key: "denomination", label: "Dénomination", type: "text", required: true, group: "Identification" },
      { key: "responsable", label: "Responsable", type: "text", required: true, group: "Identification" },
      { key: "baptises", label: "Membres Baptisés", type: "number", group: "Effectifs" },
      { key: "actifs", label: "Membres Actifs", type: "number", group: "Effectifs" },
      { key: "culteMembres", label: "Culte Mensuel — Membres", type: "number", group: "Culte Mensuel" },
      { key: "culteSymp", label: "Culte Mensuel — Sympathisants", type: "number", group: "Culte Mensuel" },
      { key: "culteNV", label: "Culte Mensuel — Nouveaux Venus", type: "number", group: "Culte Mensuel" },
      { key: "totalCulte", label: "Total Culte Mensuel", type: "number", computed: true, group: "Culte Mensuel" },
      { key: "johrei", label: "Pratiques Johrei", type: "number", group: "Activités" },
      { key: "fleursDistrib", label: "Fleurs Distribuées", type: "number", group: "Activités" }
    ]
  },
  diffusion: {
    title: "Rapport Diffusion",
    fields: [
      { key: "dateRapport", label: "Date du rapport", type: "date", required: true, group: "Période & Localisation" },
      { key: "province", label: "Province", type: "select", options: PROVINCES, required: true, group: "Période & Localisation" },
      { key: "typeEntite", label: "Type d'entité", type: "select", options: TYPES_ENTITE, required: true, group: "Période & Localisation" },
      { key: "denomination", label: "Dénomination", type: "text", required: true, group: "Identification" },
      { key: "responsable", label: "Responsable", type: "text", group: "Identification" },
      { key: "membresActifs", label: "Membres Actifs", type: "number", group: "Effectifs" },
      { key: "sympathisants", label: "Sympathisants", type: "number", group: "Effectifs" },
      { key: "culteMembres", label: "Culte Mensuel — Membres", type: "number", group: "Culte Mensuel" },
      { key: "culteSymp", label: "Culte Mensuel — Sympathisants", type: "number", group: "Culte Mensuel" },
      { key: "culteNV", label: "Culte Mensuel — Nouveaux Venus", type: "number", group: "Culte Mensuel" },
      { key: "totalCulte", label: "Total Culte Mensuel", type: "number", computed: true, group: "Culte Mensuel" },
      { key: "fleursDistrib", label: "Fleurs Distribuées", type: "number", group: "Activités" },
      { key: "confGoshintai", label: "Conf. Goshintai", type: "number", group: "Confirmations" },
      { key: "confOhikari", label: "Conf. Ohikari", type: "number", group: "Confirmations" },
      { key: "confReinit", label: "Conf. Réinitialisation", type: "number", group: "Confirmations" },
      { key: "confShoku", label: "Conf. Shoku", type: "number", group: "Confirmations" },
      { key: "confKannon", label: "Conf. Kannon", type: "number", group: "Confirmations" }
    ]
  },
  diffusionSuite: {
    title: "Rapport Diffusion — Suite",
    fields: [
      { key: "dateRapport", label: "Date du rapport", type: "date", required: true, group: "Période & Localisation" },
      { key: "province", label: "Province", type: "select", options: PROVINCES, required: true, group: "Période & Localisation" },
      { key: "typeEntite", label: "Type d'entité", type: "select", options: TYPES_ENTITE, required: true, group: "Période & Localisation" },
      { key: "denomination", label: "Dénomination", type: "text", required: true, group: "Identification" },
      { key: "responsable", label: "Responsable", type: "text", group: "Identification" },
      { key: "campagnesNettoyage", label: "Campagnes de Nettoyage", type: "number", group: "Activités" },
      { key: "fleursDistrib", label: "Fleurs Distribuées", type: "number", group: "Activités" },
      { key: "coursFleurs", label: "Cours d'Arrangement Floral", type: "number", group: "Activités" },
      { key: "themes", label: "Thèmes abordés", type: "textarea", group: "Notes" }
    ]
  }
};

const STORAGE_KEY = "EMM_RDC_GESTION_NATIONALE_V1";

const Store = {
  data: {
    periode: { mois: "NOVEMBRE", annee: 2026, dateReference: "2026-11-20" },
    entites: [],
    numerique: [],
    diffusion: [],
    diffusionSuite: [],
    archives: []
  },
  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      this.data = {
        periode: Object.assign({ mois: "NOVEMBRE", annee: 2026, dateReference: "2026-11-20" }, parsed.periode || {}),
        entites: Array.isArray(parsed.entites) ? parsed.entites : [],
        numerique: Array.isArray(parsed.numerique) ? parsed.numerique : [],
        diffusion: Array.isArray(parsed.diffusion) ? parsed.diffusion : [],
        diffusionSuite: Array.isArray(parsed.diffusionSuite) ? parsed.diffusionSuite : [],
        archives: Array.isArray(parsed.archives) ? parsed.archives : []
      };
    } catch (e) {}
  },
  save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data)); } catch (e) {}
  },
  getByType(type) {
    return this.data[type] || [];
  },
  add(type, item) {
    const record = Object.assign({ id: "id_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6) }, item);
    this.data[type].push(record);
    this.save();
    return record;
  },
  update(type, id, item) {
    const idx = this.data[type].findIndex(r => r.id === id);
    if (idx !== -1) {
      this.data[type][idx] = Object.assign({}, this.data[type][idx], item, { id });
      this.save();
    }
  },
  remove(type, id) {
    this.data[type] = this.data[type].filter(r => r.id !== id);
    this.save();
  },
  archive(type, id) {
    const idx = this.data[type].findIndex(r => r.id === id);
    if (idx === -1) return;
    const [item] = this.data[type].splice(idx, 1);
    const now = new Date();
    this.data.archives.unshift(Object.assign({}, item, {
      originalType: type,
      archivedAt: now.toISOString(),
      archiveAnnee: item.periodeAnnee || this.data.periode.annee || now.getFullYear(),
      archiveMois: item.periodeMois || this.data.periode.mois || MOIS_LISTE[now.getMonth()]
    }));
    this.save();
  }
};
