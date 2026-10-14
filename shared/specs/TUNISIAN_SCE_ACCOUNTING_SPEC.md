# SANDRA GESTION - Spécifications Comptables Système Comptable des Entreprises (SCE - Tunisie)
**Auteur du projet : Radhwen Ennaceur**

## 1. Cadre Légal et Normatif Tunisien
Le système comptable de SANDRA GESTION est conforme à la loi n° 96-112 du 30 décembre 1996 relative au système comptable des entreprises (SCE) en Tunisie et aux normes comptables tunisiennes (NCT) approuvées par arrêtés du Ministre des Finances.

### 1.1 Cadre des 7 Classes du Plan Comptable Général Tunisien (NCT 1)
- **Classe 1 : Comptes de Capitaux Propres et Passifs non courants**
  - 10 : Capital (101 Capital social, 108 Compte de l'exploitant)
  - 11 : Réserves (111 Réserve légale, 112 Réserves statutaires)
  - 12 : Résultats reportés
  - 13 : Résultat de l'exercice (131 Bénéfice, 139 Perte)
  - 15 : Provisions pour risques et charges
  - 16 : Emprunts et dettes assimilées
- **Classe 2 : Comptes d'Actifs non courants (Immobilisations)**
  - 21 : Immobilisations incorporelles (Frais R&D, Brevets, Logiciels)
  - 22 : Immobilisations corporelles (Terrains, Bâtiments, Matériel industriel d'usine)
  - 23 : Immobilisations en cours
  - 27 : Immobilisations financières
  - 28 : Amortissements des immobilisations
- **Classe 3 : Comptes de Stocks (Crucial pour usines & usines de fabrication)**
  - 31 : Matières premières et fournitures liées
  - 32 : Autres approvisionnements
  - 33 : En-cours de production de biens
  - 34 : En-cours de production de services
  - 35 : Produits finis
  - 37 : Marchandises
  - 39 : Provisions pour dépréciation des stocks
- **Classe 4 : Comptes de Tiers**
  - 40 : Fournisseurs et comptes rattachés (401 Fournisseurs d'exploitation, 408 Factures non parvenues)
  - 41 : Clients et comptes rattachés (411 Clients, 416 Clients douteux, 418 Factures à établir)
  - 42 : Personnel et comptes rattachés (421 Salaires dus, 425 Avances)
  - 43 : Sécurité sociale et organismes sociaux (CNSS)
  - 44 : État et collectivités publiques :
    - 445 : Taxes sur le chiffre d'affaires (4452 TVA sur achats, 4457 TVA collectée sur ventes, 4455 TVA à décaisser)
    - 447 : Retenues à la source (RS 1.5% sur honoraires/services, RS 15% loyers, RS 1% marchés)
    - 446 : Timbre fiscal dû à l'État
- **Classe 5 : Comptes Financiers (Trésorerie)**
  - 51 : Établissements bancaires (Banques tunisiennes : BIAT, BNA, Attijari, STB, BH, etc.)
  - 53 : Caisse (531 Caisse centrale en Dinars Tunisiens)
  - 58 : Virements internes
- **Classe 6 : Comptes de Charges**
  - 60 : Achats consommés (601 Matières premières, 602 Fournitures)
  - 61/62 : Services extérieurs (Loyers, Entretien matériel d'usine, Assurances, Transport)
  - 64 : Impôts, taxes et versements assimilés (Taxe TFP, FOPROLOS, Droit de timbre)
  - 65 : Charges diverses ordinaires
  - 66 : Charges de personnel (661 Salaires de base, 662 Charges sociales patronales CNSS 16.57%)
  - 68 : Dotations aux amortissements et provisions
- **Classe 7 : Comptes de Produits**
  - 70 : Ventes de produits fabriqués, prestations de services et marchandises
    - 701 : Ventes de produits finis
    - 706 : Prestations de services
    - 707 : Ventes de marchandises
  - 71 : Production stockée (Variation des stocks de PF et en-cours)
  - 75 : Produits divers ordinaires
  - 77 : Produits financiers

## 2. Monnaie et Décimales
- **Dinar Tunisien (TND)** avec **trois (3) décimales obligatoires** appelées **Millimes** (ex: 1 250,750 TND).
- Règle d'arrondi : Arrondi bancaire ou au millime le plus proche selon les normes fiscales de la DGI (Direction Générale des Impôts de Tunisie).
