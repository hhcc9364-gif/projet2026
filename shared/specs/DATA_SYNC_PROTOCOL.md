# SANDRA GESTION - Protocole de Synchronisation Sécurisée Hors-Ligne (Windows / Android)
**Auteur du projet : Radhwen Ennaceur**

Ce document spécifie le protocole de synchronisation bidirectionnelle résilient entre l'exécutable Windows de bureau (`sandragestion.exe`) et l'application mobile native Android (`SandraGESTION.apk`).

---

## 1. Principes Fondamentaux & Fonctionnement Local-First
1. **Autonomie Locale 100% Hors-Ligne** : Chaque terminal (PC de bureau d'usine ou tablette Android de chef d'atelier) possède sa base de données SQLite locale autonome. Aucune connexion internet continue n'est exigée pour les opérations courantes.
2. **Identifiants Universels Stables (UUIDv4)** : Tous les enregistrements créés localement (factures, ordres de fabrication, mouvements de stocks) reçoivent un UUID unique immuable dès leur création hors-ligne, interdisant toute collision d'identifiants.
3. **Imperméabilité Multi-Sociétés (Tenant Validation)** : Tout paquet de synchronisation inclut obligatoirement le `company_id` cryptographiquement validé. Les données ne peuvent sous aucun prétexte transiter vers une autre société.

---

## 2. Structure d'un Paquet de Synchronisation Chiffré (Envelope)

```json
{
  "sync_protocol_version": "2.0.0",
  "packet_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "client_device_id": "android-tablet-workshop-04",
  "company_id": "comp-sfax-01",
  "timestamp": "2026-10-14T11:45:00Z",
  "change_vector": 142,
  "signature_sha256": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  "changes": [
    {
      "table": "production_orders",
      "operation": "UPDATE",
      "record_id": "of-2026-089",
      "data": {
        "quantity_produced": 9850,
        "quantity_scrap": 150,
        "status": "COMPLETED"
      },
      "vector": 142,
      "updated_at": "2026-10-14T11:42:00Z"
    }
  ]
}
```

---

## 3. Stratégie de Résolution des Conflits
1. **Transactions Financières Immutables** :
   - Factures d'achats/ventes validées et écritures comptables ne sont **JAMAIS écrasées**. En cas d'erreur, une écriture de contre-passation (annulation) est générée.
2. **Ordres de Fabrication Usine & Stocks** :
   - Horodatage vectoriel (Vector Clocks).
   - En cas d'édition concurrente sur la même ressource, le système adopte la règle de convergence avec archivage de la version concurrente dans `sync_change_log` pour arbitrage par le responsable d'usine.
3. **Idempotence Absolue** : Si le même paquet de synchronisation est soumis plusieurs fois suite à une instabilité réseau, le serveur de synchronisation l'ignore sans créer de doublon.
