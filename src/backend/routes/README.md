# Endpoints

## `GET /api/salles`

### Rôle

Renvoie toutes les salles stockées dans la base de données avec leurs informations associées.

### Paramètres

Aucun

### Exemple

```
/api/salles
```

### Réponse (format JSON)

```json
[
    {
        "id": ID DE LA SALLE (CHAINE),
        "nom": NOM REEL DE LA SALLE (CHAINE),
        "alias": ALIAS DE LA SALLE (CHAINE),
        "places_assises": PLACES ASSISES (NOMBRE ENTIER),
        "batiment": NOM DU BATIMENT (CHAINE),
        "disponible": LA SALLE EST ACTUELLEMENT LIBRE (BOOLEEN),
        "caracteristiques": CARACTERISTIQUES DE LA SALLE (LISTE DE CHAINES)
    },
    ...
]
```

## `GET /api/salles/disponibles`

### Rôle

Renvoie  les salles disponibles sur une période spécifiée.

### Paramètres

 - `debut` : une date au format ISO
 - `fin` : une date au format ISO
 - *(OPTIONNEL) `noirs` : le nombre minimum de tableaux noirs*
 - *(OPTIONNEL) `blancs` : le nombre minimum de tableaux blancs*
 - *(OPTIONNEL) `visio` : si la salle doit avoir pour caractéristique `visio`*
 - *(OPTIONNEL) `ilot` : si la salle doit avoir pour caractéristique `ilot`*
 - *(OPTIONNEL) `ordis` : si la salle doit avoir pour caractéristique `video`*
 - *(OPTIONNEL) `places` : le nombre minimum de places assises*

> **Attention à l'encodage :** le caractère `+` devient `%2B`

> Les paramètres `visio`, `ilot` et `ordis` peuvent avoir n'importe quelle valeur, leur seule présence signifie qu'ils sont inclus dans le filtre  
> *Ex : `ilot=true`, `ilot=faux` ou encore `ilot=blalbla` retourneront des salles en ilot*

### Exemple

```
/api/salles/disponibles?debut=2024-11-04T08:00:00%2B01:00&fin=2024-11-04T09:00:00%2B01:00
```

```
/api/salles/disponibles?debut=2024-12-26T20%3A16%3A00%2B01%3A00&fin=2024-12-26T22%3A16%3A00%2B01%3A00&blancs=1&noirs=1
```

```
/api/salles/disponibles?debut=2024-12-26T20%3A16%3A00%2B01%3A00&fin=2024-12-26T22%3A16%3A00%2B01%3A00&visio=vrai&ordis=vrai
```

### Réponse (format JSON)

```json
[
    {
        "id": ID DE LA SALLE (CHAINE),
        "nom": NOM REEL DE LA SALLE (CHAINE),
        "alias": ALIAS DE LA SALLE (CHAINE),
        "places_assises": PLACES ASSISES (NOMBRE ENTIER),
        "batiment": NOM DU BATIMENT (CHAINE),
        "disponible": LA SALLE EST ACTUELLEMENT LIBRE (BOOLEEN),
        "caracteristiques": CARACTERISTIQUES DE LA SALLE (LISTE DE CHAINES)
    },
    ...
]
```

## `GET /api/salles/edt`

### Rôle

Renvoie l'emploi du temps d'une salle pendant une semaine donnée (par défaut, la semaine actuelle).

### Paramètres

 - `id` : l'id de la salle
 - *(OPTIONNEL) `increment` : un nombre à ajouter au numéro de semaine actuel*

### Exemple

```
/api/salles/edt?id=672901cd13546ff7b6eeb466&increment=2
```

```
/api/salles/edt?id=672901cd13546ff7b6eeb466
```
> La requête précédente renvoie l'emploi du temps de la salle pour la semaine actuelle

### Réponse (format JSON)

```json
{
    "cours": [
        {
            "id_cours": ID DU COURS (CHAINE),
            "debut": DATE DE DEBUT DU COURS (CHAINE),
            "fin": DATE DE FIN DU COURS (CHAINE),
            "duree": DUREE DU COURS EN POURCENTAGE (1h = 100%) (NOMBRE ENTIER),
            "overflow": DEPASSEMENT DES MINUTES EN POURCENT (NEGATIF OU POSITIF SELON QUE L'HEURE PRECEDENTE OU SUIVANTE EST LA PLUS PROCHE) (NOMBRE ENTIER),
            "id_salle": ID DE LA SALLE (CHAINE),
            "professeur": NOM DU PROFESSEUR (CHAINE),
            "module": NOM DU MODULE (CHAINE),
            "groupe": NOM DU(DES) GROUPE(S) ASSOCIE(S) (LISTE DE CHAINES),
            "couleur": COULEUR DU COURS (CHAINE)
        },
        ...
    ],
    "infos_semaine": {
        "debut": DATE DE DEBUT DE LA SEMAINE (CHAINE),
        "fin": DATE DE FIN DE LA SEMAINE (CHAINE),
        "numero": NUMERO DE LA SEMAINE (NOMBRE ENTIER)
    }
}
```

## `GET /api/app/version`

### Rôle

Renvoie la version actuelle de l'application.

### Paramètres

Aucun

### Exemple

```
/api/app/version
```

### Réponse (format JSON)

```json
{
    "version": VERSION DE L'APPLICATION (CHAINE)
}
```