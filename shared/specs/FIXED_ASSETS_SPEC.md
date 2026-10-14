# SANDRA GESTION - Immobilisations & Amortissements (SCE Tunisie)
**Auteur du projet : Radhwen Ennaceur**

Ce document spécifie les règles de gestion du registre des immobilisations et le calcul des tableaux d'amortissement selon la Norme Comptable Tunisienne NCT 5 (Immobilisations corporelles) et le Code de l'IRPP et de l'IS.

---

## 1. Définition et Règles d'Entrée au Bilan
- **Coût d'Acquisition (Valeur brute d'entrée)** :
  $$\text{Coût d'acquisition} = \text{Prix d'achat net de remises HT} + \text{Frais de douane} + \text{Frais de transport} + \text{Frais de montage et d'installation}$$
  *(La TVA déductible est exclue du coût d'entrée)*.
- **Date de mise en service (Commissioning date)** : C'est la date de départ du calcul de l'amortissement. Si l'acquisition a lieu en cours d'exercice, le calcul de la première annuité se fait **au prorata temporis (en nombre de jours / 360 ou mois entiers)**.

---

## 2. Modes d'Amortissement

### 2.1 Amortissement Linéaire (Régime de droit commun)
- **Taux Annuel** : $T = \frac{100\%}{\text{Durée d'utilité (années)}}$
- **Annuité d'Amortissement annuelle** :
  $$\text{Annuité} = \text{Base Amortissable} \times T \times \frac{\text{Nombre de mois ou jours d'utilisation}}{12 \text{ mois}}$$
- **Valeur Nette Comptable (VNC)** :
  $$\text{VNC} = \text{Valeur Brute} - \sum \text{Amortissements Cumulés}$$

### 2.2 Durées Fiscales Indicatives Usuelles en Tunisie (Article 12 du Code de l'IRPP et de l'IS)
- Bâtiments industriels usines : 20 ans (5%).
- Matériel et outillage industriel de fabrication : 5 à 10 ans (10% à 20%).
- Matériel informatique et logiciels : 3 à 5 ans (20% à 33.33%).
- Matériel roulant et de transport : 5 ans (20%).
- Mobilier de bureau et agencements : 10 ans (10%).

---

## 3. Écritures Comptables et Protection contre les Doublons
- **Dotation Annuelle d'Amortissement** :
  - **Débit 681100 (Dotations aux amortissements des immobilisations corporelles)**
  - **Crédit 282xxx (Amortissements de l'immobilisation concernée)**
- **Verrouillage de Période** : L'enregistrement d'une dotation pour une immobilisation et un exercice fiscal donné génère une contrainte d'unicité `UNIQUE(asset_id, fiscal_year)`. Toute tentative de double écriture pour le même exercice est automatiquement bloquée par le moteur métier et la base de données.
