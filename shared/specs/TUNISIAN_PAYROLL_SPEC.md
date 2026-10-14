# SANDRA GESTION - Spécifications de la Paie Tunisienne
**Auteur du projet : Radhwen Ennaceur**

Ce document détaille les règles et barèmes légaux de la paie en Tunisie, applicables aux ouvriers d'usines et salariés d'entreprises.

---

## 1. Cadre Réglementaire et Sources Officielles
- **Code du Travail Tunisien** (Loi n° 66-27 du 30 avril 1966 modifiée).
- **Code de l'IRPP et de l'IS** (Impôt sur le Revenu des Personnes Physiques).
- **Régime de Sécurité Sociale (CNSS)** : Décret n° 74-499 du 27 avril 1974.
- **Lois de Finances de la République Tunisienne**.

---

## 2. Cotisations Sociales CNSS (Caisse Nationale de Sécurité Sociale)

### 2.1 Cotisation Salariale (Déductible du Brut)
- **Taux standard (Régime Général des salariés non agricoles)** : **9,18%**
  - Assiette de calcul : Salaire brut total (salaire de base + primes imposables + heures supplémentaires).
  - Plafond : Pas de plafond de salaire pour le régime général en Tunisie (cotisation sur la totalité du brut).

### 2.2 Cotisations Patronales (À la charge de l'entreprise/usine)
- **CNSS Patronale standard** : **16,57%**
- **Assurance Accidents du Travail et Maladies Professionnelles** : **Taux variable de 0,4% à 5,0%** selon le secteur d'activité et le risque de l'usine (moyenne usines de plasturgie/métallurgie : 1,5% à 2,2%).
- **FOPROLOS (Fonds de Promotion des Logements Sociaux)** : **1,00%** de la masse salariale brute.
- **TFP (Taxe de Formation Professionnelle)** :
  - **1,00%** pour les entreprises et usines du secteur des industries manufacturières.
  - **2,00%** pour les autres activités commerciales et de services.

---

## 3. Impôt sur le Revenu des Personnes Physiques (IRPP)

### 3.1 Déductions Légales sur le Brut Imposable
1. **Frais Professionnels** : Déduction forfaitaire de **10%** du brut imposable (après déduction de la CNSS 9.18%), avec un **plafond légal annuel de 2 000 TND** (soit environ 166,666 TND par mois).
2. **Déduction Chef de Famille** : Déduction annuelle de **300 TND** (soit 25,000 TND par mois) pour le salarié chef de famille.
3. **Déduction pour Enfants à Charge** :
   - 1er enfant : 100 TND / an.
   - 2ème enfant : 100 TND / an.
   - 3ème enfant : 100 TND / an.
   - 4ème enfant : 100 TND / an.
   - Enfant poursuivant des études supérieures non boursier : 1 000 TND / an.
   - Enfant handicapé : 2 000 TND / an.

### 3.2 Barème Progressif IRPP Annuel
| Tranche de Revenu Net Imposable Annuel (TND) | Taux Applicable |
| :--- | :--- |
| De 0 à 5 000 TND | **0%** (Exonéré) |
| De 5 000,001 à 20 000 TND | **26%** |
| De 20 000,001 à 30 000 TND | **28%** |
| De 30 000,001 à 50 000 TND | **32%** |
| Au-delà de 50 000 TND | **35%** |

*Note de validation* : SANDRA GESTION intègre une table paramétrable de barème fiscal permettant d'appliquer les mises à jour adoptées par les lois de finances sans rupture de code.

---

## 4. Schéma Comptable d'Intégration de la Paie (SCE)
Journal des Opérations Diverses (OD - Paie mensuelle) :
- **Débit 641000 (Rémunérations du personnel)** : Salaire brut total.
- **Débit 645100 (Charges de sécurité sociale CNSS patronale)** : Total charges patronales.
- **Débit 645200 (Assurance Accidents du travail)**.
- **Débit 642100 (Taxe TFP)**.
- **Débit 642200 (Taxe FOPROLOS)**.
- **Crédit 431000 (CNSS)** : Somme CNSS salariale (9.18%) + patronale (16.57%) + accident.
- **Crédit 447100 (État - Retenue à la source IRPP sur salaires)**.
- **Crédit 425000 (Avances et acomptes consentis au personnel)**.
- **Crédit 421000 (Personnel - Rémunérations dues / Salaires nets à payer)**.
- Règle stricte : **Total Débit === Total Crédit** obligatoire.
