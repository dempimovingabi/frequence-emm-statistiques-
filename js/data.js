const PROVINCES = ["Kinshasa", "Kasaï-Central", "Kasaï", "Kasaï Oriental", "Lomami", "Haut-Katanga", "Lualaba", "Kongo-Central", "Kwilu", "Autres Provinces"];

const SCHEMAS = {
  numerique: {
    title: "Rapport Numérique — Entité",
    fields: [
      { key: "province", label: "Province", type: "select", options: PROVINCES, required: true },
      { key: "typeEntite", label: "Type Entité", type: "text" },
      { key: "denomination", label: "Dénomination", type: "text", required: true },
      { key: "responsable", label: "Responsable", type: "text" },
      { key: "baptises", label: "Membres Baptisés", type: "number", group: "Membres" },
      { key: "actifs", label: "Membres Actifs", type: "number", group: "Membres" },
      { key: "inactifs", label: "Membres Inactifs", type: "number", group: "Membres" },
      { key: "inities", label: "Initiés", type: "number", group: "Membres" },
      { key: "entres", label: "Entrés", type: "number", group: "Membres" },
      { key: "sortis", label: "Sortis", type: "number", group: "Membres" },
      { key: "recuperes", label: "Récupérés", type: "number", group: "Membres" },
      { key: "decedes", label: "Décédés", type: "number", group: "Membres" },
      { key: "freqMembres", label: "Fréq. Membres", type: "number", group: "Fréquentation Mensuelle" },
      { key: "freqSymp", label: "Fréq. Sympathisants", type: "number", group: "Fréquentation Mensuelle" },
      { key: "freqNV", label: "Fréq. Nouveaux Venus", type: "number", group: "Fréquentation Mensuelle" },
      { key: "freqAchemines", label: "Acheminés", type: "number", group: "Fréquentation Mensuelle" },
      { key: "freqAcheminesRestes", label: "Acheminés Restés", type: "number", group: "Fréquentation Mensuelle" },
      { key: "culteMembres", label: "Culte Membres", type: "number", group: "Culte Mensuel" },
      { key: "culteSymp", label: "Culte Sympathisants", type: "number", group: "Culte Mensuel" },
      { key: "culteNV", label: "Culte Nouveaux Venus", type: "number", group: "Culte Mensuel" },
      { key: "totalCulte", label: "Total Culte Mensuel (Auto)", type: "number", group: "Culte Mensuel", computed: true },
      { key: "johrei", label: "Pratiques Johrei", type: "number", group: "Activités" },
      { key: "elevSanguetsu", label: "Élèves Sanguetsu", type: "number", group: "Activités" },
      { key: "fleursDistrib", label: "Fleurs Distribuées", type: "number", group: "Activités" },
      { key: "potagers", label: "Potagers", type: "number", group: "Activités" },
      { key: "assistMembres", label: "Assistances Membres", type: "number", group: "Assistances & Nettoyages" },
      { key: "assistSymp", label: "Assistances Sympathisants", type: "number", group: "Assistances & Nettoyages" },
      { key: "nettoyagesMembres", label: "Nettoyages Membres", type: "number", group: "Assistances & Nettoyages" },
      { key: "nettoyagesSymp", label: "Nettoyages Sympathisants", type: "number", group: "Assistances & Nettoyages" }
    ]
  },
  diffusion: {
    title: "Rapport Diffusion — Entité",
    fields: [
      { key: "province", label: "Province", type: "select", options: PROVINCES, required: true },
      { key: "typeEntite", label: "Type Entité", type: "text" },
      { key: "denomination", label: "Dénomination", type: "text", required: true },
      { key: "responsable", label: "Responsable", type: "text" },
      { key: "encadrNbre", label: "Encadrements (Nbre)", type: "number", group: "Encadrements" },
      { key: "encadrJour", label: "Encadrements (Jours)", type: "number", group: "Encadrements" },
      { key: "membresActifs", label: "Membres Actifs", type: "number" },
      { key: "sympathisants", label: "Sympathisants", type: "number" },
      { key: "culteMembres", label: "Culte Membres", type: "number", group: "Culte Mensuel" },
      { key: "culteSymp", label: "Culte Sympathisants", type: "number", group: "Culte Mensuel" },
      { key: "culteNV", label: "Culte Nouveaux Venus", type: "number", group: "Culte Mensuel" },
      { key: "totalCulte", label: "Total Culte Mensuel (Auto)", type: "number", group: "Culte Mensuel", computed: true },
      { key: "foyersAccomp", label: "Foyers Accompagnés", type: "number" },
      { key: "membresAvecGoshintai", label: "Membres avec Goshintai", type: "number" },
      { key: "membresSansGoshintai", label: "Membres sans Goshintai", type: "number" },
      { key: "foyersSymp", label: "Foyers Sympathisants", type: "number" },
      { key: "fleursDistrib", label: "Fleurs Distribuées", type: "number" },
      { key: "potagers", label: "Potagers", type: "number" },
      { key: "maisonsFleurs", label: "Maisons Ouvertes avec Fleurs", type: "number" },
      { key: "temoignages", label: "Témoignages", type: "number" },
      { key: "freqMembres", label: "Fréq. Membres", type: "number", group: "Fréquentation Mensuelle" },
      { key: "freqSymp", label: "Fréq. Sympathisants", type: "number", group: "Fréquentation Mensuelle" },
      { key: "freqNV", label: "Fréq. Nouveaux Venus", type: "number", group: "Fréquentation Mensuelle" },
      { key: "confGoshintai", label: "Confirmations Goshintai", type: "number", group: "Confirmations" },
      { key: "confOhikari", label: "Confirmations Ohikari", type: "number", group: "Confirmations" },
      { key: "confReinit", label: "Confirmations Réinitiation", type: "number", group: "Confirmations" },
      { key: "confShoku", label: "Confirmations Shoku", type: "number", group: "Confirmations" },
      { key: "confKannon", label: "Confirmations Kannon", type: "number", group: "Confirmations" },
      { key: "concessionsAgri", label: "Concessions Agricoles", type: "number" },
      { key: "produitsDispo", label: "Produits Disponibles", type: "text" }
    ]
  },
  diffusionSuite: {
    title: "Diffusion Suite — Entité",
    fields: [
      { key: "province", label: "Province", type: "select", options: PROVINCES, required: true },
      { key: "typeEntite", label: "Type Entité", type: "text" },
      { key: "denomination", label: "Dénomination", type: "text", required: true },
      { key: "responsable", label: "Responsable", type: "text" },
      { key: "campagnesNettoyage", label: "Campagnes Nettoyages", type: "number" },
      { key: "fleursDistrib", label: "Fleurs Distribuées", type: "number" },
      { key: "coursFleurs", label: "Cours Fleurs Réalisés", type: "number" },
      { key: "themes", label: "Thèmes Abordés", type: "textarea" },
      { key: "graces", label: "Grâces Reçues", type: "textarea" },
      { key: "pointsAmeliorer", label: "Points à Améliorer", type: "textarea" },
      { key: "propositions", label: "Propositions", type: "textarea" },
      { key: "objectifs", label: "Objectifs", type: "textarea" },
      { key: "actions", label: "Actions", type: "textarea" }
    ]
  }
};

const Store = {
  KEY: "emm_rdc_data_v1",
  data: { periode: { mois: "NOVEMBRE", annee: 2026, dateCloture: "30/11/2026" }, numerique: [], diffusion: [], diffusionSuite: [], archives: [] },
  load() { try { const raw = localStorage.getItem(this.KEY); if (raw) this.data = JSON.parse(raw); } catch (e) { console.warn(e); } return this.data; },
  save() { localStorage.setItem(this.KEY, JSON.stringify(this.data)); },
  add(type, record) { record.id = Date.now() + "_" + Math.random().toString(36).slice(2, 7); record.createdAt = new Date().toISOString(); this.data[type].push(record); this.save(); return record; },
  update(type, id, record) { const idx = this.data[type].findIndex(r => r.id === id); if (idx >= 0) { this.data[type][idx] = { ...this.data[type][idx], ...record, updatedAt: new Date().toISOString() }; this.save(); return true; } return false; },
  remove(type, id) { const idx = this.data[type].findIndex(r => r.id === id); if (idx >= 0) { this.data[type].splice(idx, 1); this.save(); return true; } return false; },
  archive(type, id) { const idx = this.data[type].findIndex(r => r.id === id); if (idx >= 0) { const rec = this.data[type].splice(idx, 1)[0]; rec.archivedAt = new Date().toISOString(); rec.originalType = type; this.data.archives.push(rec); this.save(); return true; } return false; },
  getByType(type) { return this.data[type] || []; }
};

