const PROVINCES = [
  "Kinshasa","Kongo-Central","Kwango","Kwilu","Maï-Ndombe",
  "Équateur","Mongala","Nord-Ubangi","Sud-Ubangi","Tshuapa",
  "Haut-Katanga","Lualaba","Haut-Lomami","Tanganyika",
  "Kasaï","Kasaï-Central","Kasaï-Oriental","Lomami","Sankuru",
  "Nord-Kivu","Sud-Kivu","Maniema","Ituri","Haut-Uele","Bas-Uele","Tshopo"
];

const TYPES_ENTITE = [
  "Centre de Formation",
  "Johrei Center",
  "Unité religieuse",
  "Foyer de Lumière",
  "Noyau du salut"
];

const MOIS_LISTE = [
  "JANVIER", "FÉVRIER", "MARS", "AVRIL", "MAI", "JUIN",
  "JUILLET", "AOÛT", "SEPTEMBRE", "OCTOBRE", "NOVEMBRE", "DÉCEMBRE"
];

const SCHEMAS = {
  numerique: {
    title: "Rapport Numérique",
    fields: [
      { key: "dateRapport", label: "Date du rapport", type: "date", group: "Identification" },
      { key: "province", label: "Province", type: "select", options: PROVINCES, required: true, group: "Identification" },
      { key: "typeEntite", label: "Type d'entité", type: "select", options: TYPES_ENTITE, required: true, group: "Identification" },
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
      { key: "dateRapport", label: "Date du rapport", type: "date", group: "Identification" },
      { key: "province", label: "Province", type: "select", options: PROVINCES, required: true, group: "Identification" },
      { key: "typeEntite", label: "Type d'entité", type: "select", options: TYPES_ENTITE, group: "Identification" },
      { key: "denomination", label: "Dénomination", type: "text", required: true, group: "Identification" },
      { key: "responsable", label: "Responsable", type: "text", required: true, group: "Identification" },
      { key: "membresActifs", label: "Membres Actifs", type: "number", group: "Effectifs" },
      { key: "sympathisants", label: "Sympathisants", type: "number", group: "Effectifs" },
      { key: "culteMembres", label: "Culte Mensuel — Membres", type: "number", group: "Culte Mensuel" },
      { key: "culteSymp", label: "Culte Mensuel — Sympathisants", type: "number", group: "Culte Mensuel" },
      { key: "culteNV", label: "Culte Mensuel — Nouveaux Venus", type: "number", group: "Culte Mensuel" },
      { key: "totalCulte", label: "Total Culte Mensuel", type: "number", computed: true, group: "Culte Mensuel" },
      { key: "fleursDistrib", label: "Fleurs Distribuées", type: "number", group: "Activités" },
      { key: "confGoshintai", label: "Confirmations Goshintai", type: "number", group: "Confirmations" },
      { key: "confOhikari", label: "Confirmations Ohikari", type: "number", group: "Confirmations" },
      { key: "confReinit", label: "Réinitiations", type: "number", group: "Confirmations" },
      { key: "confShoku", label: "Confirmations Shoku", type: "number", group: "Confirmations" },
      { key: "confKannon", label: "Confirmations Kannon", type: "number", group: "Confirmations" }
    ]
  },
  diffusionSuite: {
    title: "Rapport Diffusion — Suite",
    fields: [
      { key: "dateRapport", label: "Date du rapport", type: "date", group: "Identification" },
      { key: "province", label: "Province", type: "select", options: PROVINCES, required: true, group: "Identification" },
      { key: "typeEntite", label: "Type d'entité", type: "select", options: TYPES_ENTITE, required: true, group: "Identification" },
      { key: "denomination", label: "Dénomination", type: "text", required: true, group: "Identification" },
      { key: "responsable", label: "Responsable", type: "text", required: true, group: "Identification" },
      { key: "campagnesNettoyage", label: "Campagnes de Nettoyage", type: "number", group: "Action Sociale & Environnement" },
      { key: "fleursDistrib", label: "Fleurs Distribuées", type: "number", group: "Action Sociale & Environnement" },
      { key: "coursFleurs", label: "Cours d'Arrangement Floral", type: "number", group: "Action Sociale & Environnement" },
      { key: "themes", label: "Thèmes Abordés", type: "textarea", group: "Enseignements" }
    ]
  }
};

const DEFAULT_DATA = {
  periode: { mois: "NOVEMBRE", annee: 2026, dateReference: "2026-11-19" },
  numerique: [],
  diffusion: [],
  diffusionSuite: [],
  archives: []
};

const STORAGE_KEY = "EMM_RDC_GESTION_NATIONALE_V1";
const Store = {
  data: null,
  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      this.data = raw ? JSON.parse(raw) : JSON.parse(JSON.stringify(DEFAULT_DATA));
    } catch (e) {
      this.data = JSON.parse(JSON.stringify(DEFAULT_DATA));
    }
    this.data.numerique = this.data.numerique || [];
    this.data.diffusion = this.data.diffusion || [];
    this.data.diffusionSuite = this.data.diffusionSuite || [];
    this.data.archives = this.data.archives || [];
    this.data.periode = Object.assign(
      { mois: "NOVEMBRE", annee: 2026, dateReference: "2026-11-19" },
      this.data.periode || {}
    );
  },
  save() { localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data)); },
  getByType(type) { return this.data[type] || []; },
  add(type, record) {
    record.id = "id_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6);
    record.periodeMois = record.periodeMois || this.data.periode.mois;
    record.periodeAnnee = record.periodeAnnee || this.data.periode.annee;
    this.data[type].push(record);
    this.save();
    return record;
  },
  update(type, id, record) {
    const list = this.data[type];
    const idx = list.findIndex(r => r.id === id);
    if (idx !== -1) {
      list[idx] = Object.assign({}, list[idx], record, { id });
      this.save();
    }
  },
  remove(type, id) {
    this.data[type] = this.data[type].filter(r => r.id !== id);
    this.save();
  },
  archive(type, id) {
    const list = this.data[type];
    const idx = list.findIndex(r => r.id === id);
    if (idx !== -1) {
      const [item] = list.splice(idx, 1);
      const now = new Date();
      const refDate = item.dateRapport || this.data.periode.dateReference || now.toISOString().slice(0, 10);
      const parsedDate = new Date(refDate + "T12:00:00");
      const archiveAnnee = String(
        item.periodeAnnee ||
        (!isNaN(parsedDate.getTime()) ? parsedDate.getFullYear() : this.data.periode.annee || now.getFullYear())
      );
      const archiveMois = String(
        item.periodeMois ||
        (!isNaN(parsedDate.getTime()) ? MOIS_LISTE[parsedDate.getMonth()] : this.data.periode.mois || MOIS_LISTE[now.getMonth()])
      ).toUpperCase();

      this.data.archives.unshift(Object.assign({}, item, {
        archivedAt: now.toISOString(),
        originalType: type,
        archiveAnnee,
        archiveMois,
        dateReference: refDate
      }));
      this.save();
    }
  }
};
