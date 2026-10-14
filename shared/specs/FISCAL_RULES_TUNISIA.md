# SANDRA GESTION - Règles Fiscales Officielles Tunisiennes
**Auteur du projet : Radhwen Ennaceur**

Ce document spécifie les règles de calcul fiscal appliquées dans SANDRA GESTION pour les entreprises et usines en Tunisie.

## 1. Taux de Taxe sur la Valeur Ajoutée (TVA) en Tunisie
Conformément au Code de la TVA en Tunisie :
- **Taux normal : 19%**
  - Produits industriels, fabrication mécanique/textile/plastique, commerce de gros et détail de biens ordinaires, prestations de services informatiques et télécoms.
- **Taux réduit : 7%**
  - Produits d'équipements informatiques, prestations hôtelières et restauration touristique, produits pharmaceutiques de base, transport de marchandises.
- **Taux intermédiaire : 13%**
  - Prestations d'ingénierie, architecture, conseil juridique, certaines activités libérales.
- **Taux nul / Exonéré : 0%**
  - Entreprises totalement exportatrices (Sociétés de Commerce International, régime off-shore, loi n° 2016-71 portant loi de l'investissement avec attestation d'achat en suspension de TVA délivrée par le centre de contrôle des impôts).

## 2. Droit de Timbre Fiscal
- **Montant légal standard : 1,000 TND (1 Dinar)** par facture de vente émise sur le territoire tunisien (selon l'article 39 du Code des droits d'enregistrement et de timbre).
- Le timbre fiscal s'ajoute au montant Total TTC :
  $$\text{Net à Payer} = \text{Total HT} + \text{TVA} + \text{FODEC (si applicable)} + \text{Timbre Fiscal (1.000 DT)}$$

## 3. Fonds Spéciaux Industriels (FODEC)
- Pour les usines et usines de production manufacturière : taxe de 1% sur le montant HT des ventes locales de produits industriels.
- Le FODEC entre dans l'assiette de calcul de la TVA :
  $$\text{Assiette TVA} = \text{Montant HT} \times (1 + \text{Taux FODEC})$$

## 4. Retenue à la Source (RS) Tunisienne
Applicable lorsque le client est tenu d'effectuer la retenue (établissements publics, sociétés anonymes ou personnes morales soumises au régime réel) :
- **1,5%** : Prestations de services, fournitures de travaux matériels et immatériels.
- **1,0%** : Ventes de marchandises et produits industriels aux entités publiques ou organismes étatiques.
- **15,0%** : Loyers d'immeubles, honoraires des professions non commerciales (avocats, experts-comptables sans TVA).
- **Certificat de Retenue à la Source** obligatoire délivré à l'émetteur de la facture.

## 5. Structure du Matricule Fiscal Tunisien
Délivré par le Ministère des Finances (DGI - Direction Générale des Impôts) :
- Format standard : `XXXXXXX/K/C/SSS`
  - `XXXXXXX` : 7 chiffres d'identifiant unique.
  - `K` : Clé de contrôle alphabétique (calcul de validité modulo).
  - `C` : Catégorie d'activité (`M` = Personne Morale / Société SARL, SUARL, SA; `P` = Personne Physique).
  - `SSS` : Numéro de l'établissement secondaire (`000` = Siège social principal).
- Exemple valide : `1458923/A/M/000` ou `0892314/P/P/000`.
