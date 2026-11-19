const PROVINCES = [
  "Kinshasa","Kongo-Central","Kwango","Kwilu","Maï-Ndombe",
  "Équateur","Mongala","Nord-Ubangi","Sud-Ubangi","Tshuapa",
  "Haut-Katanga","Lualaba","Haut-Lomami","Tanganyika",
  "Kasaï","Kasaï-Central","Kasaï-Oriental","Lomami","Sankuru",
  "Nord-Kivu","Sud-Kivu","Maniema","Ituri","Haut-Uele","Bas-Uele","Tshopo"
];

const SCHEMAS = {
  numerique: {
    title: "Rapport Numérique",
    fields: [
      { key: "province", label: "Province", type: "select", options: PROVINCES, required: true, group: "Identification" },
      { key: "typeEntite", label: "Type d'entité", type: "select", options: ["Préfecture","Église","Centre de Johrei","Mission"], required: true, group: "Identification" },
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
      { key: "province", label: "Province", type: "select", options: PROVINCES, required: true, group: "Identification" },
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
      { key: "province", label: "Province", type: "select", options: PROVINCES, required: true, group: "Identification" },
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
  periode: { mois: "NOVEMBRE", annee: 2026, dateCloture: "2026-11-30" },
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
    this.data.periode = this.data.periode || { mois: "NOVEMBRE", annee: 2026, dateCloture: "2026-11-30" };
  },
  save() { localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data)); },
  getByType(type) { return this.data[type] || []; },
  add(type, record) { record.id = "id_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6); this.data[type].push(record); this.save(); return record; },
  update(type, id, record) { const list = this.data[type]; const idx = list.findIndex(r => r.id === id); if (idx !== -1) { list[idx] = Object.assign({}, list[idx], record, { id }); this.save(); } },
  remove(type, id) { this.data[type] = this.data[type].filter(r => r.id !== id); this.save(); },
  archive(type, id) { const list = this.data[type]; const idx = list.findIndex(r => r.id === id); if (idx !== -1) { const [item] = list.splice(idx, 1); this.data.archives.unshift(Object.assign({}, item, { archivedAt: new Date().toISOString(), originalType: type })); this.save(); } }
};
