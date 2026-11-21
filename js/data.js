const MOIS_LISTE = [
  "JANVIER", "FÉVRIER", "MARS", "AVRIL", "MAI", "JUIN",
  "JUILLET", "AOÛT", "SEPTEMBRE", "OCTOBRE", "NOVEMBRE", "DÉCEMBRE"
];

const PROVINCES = [
  "Bas-Uele", "Équateur", "Haut-Katanga", "Haut-Lomami", "Haut-Uele",
  "Ituri", "Kasaï", "Kasaï-Central", "Kasaï-Oriental", "Kinshasa",
  "Kongo-Central", "Kwango", "Kwilu", "Lomami", "Lualaba",
  "Maindombe", "Maniema", "Mongala", "Nord-Kivu", "Nord-Ubangi",
  "Sankuru", "Sud-Kivu", "Sud-Ubangi", "Tanganyika", "Tshopo", "Tshuapa"
];

const TYPES_ENTITE = [
  "Centre de Formation",
  "Johrei Center",
  "Unité religieuse",
  "Foyer de lumière",
  "noyau de salut"
];

const SCHEMAS = {
  entites: {
    title: "Répertoire des Entités",
    fields: [
      { key: "province", label: "Province", type: "select", options: PROVINCES, required: true, group: "Identification de l'Entité" },
      { key: "typeEntite", label: "Type d'entité", type: "select", options: TYPES_ENTITE, required: true, group: "Identification de l'Entité" },
      { key: "denomination", label: "Dénomination", type: "text", required: true, group: "Identification de l'Entité" },
      { key: "responsable", label: "Responsable", type: "text", required: true, group: "Identification de l'Entité" },
      { key: "telephone", label: "Téléphone", type: "text", required: false, group: "Identification de l'Entité" },
      { key: "observations", label: "Observations", type: "textarea", required: false, group: "Identification de l'Entité" }
    ]
  },
  numerique: {
    title: "Rapport Numérique",
    fields: [
      { key: "dateRapport", label: "Date du rapport", type: "date", required: true, group: "Identification" },
      { key: "province", label: "Province", type: "select", options: PROVINCES, required: true, group: "Identification" },
      { key: "typeEntite", label: "Type d'entité", type: "select", options: TYPES_ENTITE, required: true, group: "Identification" },
      { key: "denomination", label: "Dénomination", type: "text", required: true, group: "Identification" },
      { key: "responsable", label: "Responsable", type: "text", required: true, group: "Identification" },
      { key: "baptises", label: "Membres Baptisés", type: "number", required: true, group: "Effectifs" },
      { key: "actifs", label: "Membres Actifs", type: "number", required: true, group: "Effectifs" },
      { key: "culteMembres", label: "Culte Mensuel — Membres", type: "number", required: true, group: "Culte Mensuel" },
      { key: "culteSymp", label: "Culte Mensuel — Sympathisants", type: "number", required: true, group: "Culte Mensuel" },
      { key: "culteNV", label: "Culte Mensuel — Nouveaux Venus", type: "number", required: true, group: "Culte Mensuel" },
      { key: "totalCulte", label: "Total Culte Mensuel (Auto)", type: "number", computed: true, group: "Culte Mensuel" },
      { key: "johrei", label: "Pratiques Johrei", type: "number", required: true, group: "Activités & Fleurs" },
      { key: "fleursDistrib", label: "Fleurs Distribuées", type: "number", required: true, group: "Activités & Fleurs" },
      { key: "observations", label: "Observations", type: "textarea", required: false, group: "Observations" }
    ]
  },
  diffusion: {
    title: "Rapport Diffusion",
    fields: [
      { key: "dateRapport", label: "Date du rapport", type: "date", required: true, group: "Identification" },
      { key: "province", label: "Province", type: "select", options: PROVINCES, required: true, group: "Identification" },
      { key: "typeEntite", label: "Type d'entité", type: "select", options: TYPES_ENTITE, required: true, group: "Identification" },
      { key: "denomination", label: "Dénomination", type: "text", required: true, group: "Identification" },
      { key: "responsable", label: "Responsable", type: "text", required: true, group: "Identification" },
      { key: "membresActifs", label: "Membres Actifs", type: "number", required: true, group: "Effectifs" },
      { key: "sympathisants", label: "Sympathisants", type: "number", required: true, group: "Effectifs" },
      { key: "culteMembres", label: "Culte Mensuel — Membres", type: "number", required: true, group: "Culte Mensuel" },
      { key: "culteSymp", label: "Culte Mensuel — Sympathisants", type: "number", required: true, group: "Culte Mensuel" },
      { key: "culteNV", label: "Culte Mensuel — Nouveaux Venus", type: "number", required: true, group: "Culte Mensuel" },
      { key: "totalCulte", label: "Total Culte Mensuel (Auto)", type: "number", computed: true, group: "Culte Mensuel" },
      { key: "fleursDistrib", label: "Fleurs Distribuées", type: "number", required: true, group: "Activités & Confirmations" },
      { key: "confGoshintai", label: "Confirmations — Goshintai", type: "number", required: false, group: "Activités & Confirmations" },
      { key: "confOhikari", label: "Confirmations — Ohikari", type: "number", required: false, group: "Activités & Confirmations" },
      { key: "confReinit", label: "Confirmations — Réinitialisation", type: "number", required: false, group: "Activités & Confirmations" },
      { key: "confShoku", label: "Confirmations — Shoku", type: "number", required: false, group: "Activités & Confirmations" },
      { key: "confKannon", label: "Confirmations — Kannon", type: "number", required: false, group: "Activités & Confirmations" },
      { key: "observations", label: "Observations", type: "textarea", required: false, group: "Observations" }
    ]
  },
  diffusionSuite: {
    title: "Rapport Diffusion — Suite",
    fields: [
      { key: "dateRapport", label: "Date du rapport", type: "date", required: true, group: "Identification" },
      { key: "province", label: "Province", type: "select", options: PROVINCES, required: true, group: "Identification" },
      { key: "typeEntite", label: "Type d'entité", type: "select", options: TYPES_ENTITE, required: true, group: "Identification" },
      { key: "denomination", label: "Dénomination", type: "text", required: true, group: "Identification" },
      { key: "responsable", label: "Responsable", type: "text", required: true, group: "Identification" },
      { key: "campagnesNettoyage", label: "Campagnes de Nettoyage", type: "number", required: true, group: "Activités" },
      { key: "fleursDistrib", label: "Fleurs Distribuées", type: "number", required: true, group: "Activités" },
      { key: "coursFleurs", label: "Cours d'Arrangement Floral", type: "number", required: true, group: "Activités" },
      { key: "themes", label: "Thèmes Abordés", type: "textarea", required: false, group: "Contenu & Observations" },
      { key: "observations", label: "Observations", type: "textarea", required: false, group: "Contenu & Observations" }
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
      if (raw) {
        const parsed = JSON.parse(raw);
        this.data = Object.assign({
          periode: { mois: "NOVEMBRE", annee: 2026, dateReference: "2026-11-20" },
          entites: [],
          numerique: [],
          diffusion: [],
          diffusionSuite: [],
          archives: []
        }, parsed);
      }
    } catch (e) { console.error("Erreur chargement localStorage :", e); }
    this.save();
  },
  save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data)); } catch (e) { console.error("Erreur sauvegarde localStorage :", e); }
  },
  getByType(type) { return this.data[type] || []; },
  add(type, item) {
    item.id = "id_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6);
    if (!this.data[type]) this.data[type] = [];
    this.data[type].push(item);
    this.save();
    return item;
  },
  update(type, id, updates) {
    const arr = this.data[type] || [];
    const idx = arr.findIndex(r => r.id === id);
    if (idx !== -1) { arr[idx] = Object.assign({}, arr[idx], updates); this.save(); return arr[idx]; }
    return null;
  },
  remove(type, id) {
    if (!this.data[type]) return;
    this.data[type] = this.data[type].filter(r => r.id !== id);
    this.save();
  },
  archive(type, id) {
    const arr = this.data[type] || [];
    const idx = arr.findIndex(r => r.id === id);
    if (idx === -1) return;
    const [item] = arr.splice(idx, 1);
    const refDate = item.dateReference || item.dateRapport || this.data.periode?.dateReference || new Date().toISOString().slice(0, 10);
    const parsedDate = new Date(refDate + "T12:00:00");
    const archiveAnnee = item.periodeAnnee || (!isNaN(parsedDate.getTime()) ? parsedDate.getFullYear() : (this.data.periode?.annee || 2026));
    const archiveMois = item.periodeMois || (!isNaN(parsedDate.getTime()) ? MOIS_LISTE[parsedDate.getMonth()] : (this.data.periode?.mois || "NOVEMBRE"));
    this.data.archives.push(Object.assign({}, item, {
      archivedAt: new Date().toISOString(),
      originalType: type,
      archiveAnnee,
      archiveMois
    }));
    this.save();
  }
};
