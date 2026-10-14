# SANDRA GESTION - Architecture des Deux Sessions de Gestion
**Auteur du projet : Radhwen Ennaceur**

## 1. Problématique Industrielle et Fiscale
Dans la réalité de l'industrie manufacturière et du tissu des PME/usines en Tunisie, les dirigeants ont un besoin vital de scinder :
1. La **Session Financière** (Comptabilité Légale & Fiscale conforme au SCE, déclarations mensuelles G3, TVA, FOPROLOS, CNSS).
2. La **Session Réelle** (Gestion industrielle de l'usine : planification des ateliers, suivi de fabrication réel, consommation effective des matières premières, main d'œuvre directe, gestion des rebuts et marges réelles de fabrication).

## 2. Principes Fondamentaux de Séparation

### 2.1 Cloisonnement des Données au Niveau Modèle
Toutes les entités transactionnelles (mouvements de stock, ordres d'achat, fabrication, écritures comptables, factures internes ou externes) portent un champ d'identification de session :
- `session_type = 'FINANCIERE'`
- `session_type = 'REELLE'`

### 2.2 Barrière de Sécurité et Règles de Découplage
1. **Zéro pollution réciproque automatique** : Les écritures de la session réelle ne peuvent en aucun cas s'infiltrer dans le journal légal SCE ou les états financiers officiels sans un processus explicite de validation et d'arbitrage.
2. **Droits d'accès par rôle (RBAC)** :
   - Le comptable externe ou le commissaire aux comptes n'a accès qu'à la `Session Financière`.
   - Le chef d'atelier ou responsable de production opère dans la `Session Réelle`.
   - Le chef d'entreprise (Owner) ou Super Admin a le privilège de bascule instantanée sécurisée avec indicateur visuel distinctif :
     - **Session Financière** : Teinte Bleu Nuit impérial & Or El Djem (`#0a1128` / `#c59b27`) avec macaron "LÉGAL / SCE".
     - **Session Réelle** : Teinte Ambre profond & Émeraude industrielle (`#0f281e` / `#22c55e` / `#f59e0b`) avec macaron "USINE / PRODUCTION RÉELLE".

## 3. Flux Opérationnel en Session Réelle (Usine & Fabrication)
1. **Nomenclature (BOM - Bill of Materials)** :
   - Définition des matières premières (MP) requises par unité de produit fini (PF).
   - Coût unitaire réel pondéré (PMP).
2. **Ordre de Fabrication (OF)** :
   - Statuts : Créé -> En Cours -> Terminé -> Contrôle Qualité -> Mis au Stock.
   - Consommation réelle vs théorique (écart sur matière).
   - Temps machine (heures atelier) et temps main d'œuvre ouvrière.
3. **Calcul Automatique du Coût de Revient Réel** :
   $$\text{Coût de Revient Réel} = \sum (\text{Matières Réelles}) + \sum (\text{Main d'œuvre directe}) + \text{Frais généraux d'atelier proratisés}$$
4. **Analyse de Rentabilité Réelle par Lot** :
   - Marge brute réelle calculée au millime près en Dinars Tunisiens (TND).
