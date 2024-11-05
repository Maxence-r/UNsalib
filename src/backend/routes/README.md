# Endpoints

## `/salles`

### Rôle

Renvoie toutes les salles stockées dans la base de données avec leurs informations associées.

### Paramètres

Aucun

### Exemple

```
/salles
```

### Réponse (format JSON)

```json
[
    {
        "id": ID DE LA SALLE (CHAINE),
        "nom_salle": NOM DE LA SALLE (CHAINE),
        "places_assises": PLACES ASSISES (NOMBRE ENTIER),
        "batiment": NOM DU BATIMENT (CHAINE)
    },
    ...
]
```

## `/salles/disponibles`

### Rôle

Renvoie  les salles disponibles sur une période spécifiée.

### Paramètres

 - `debut` : une date au format ISO
 - `fin` : une date au format ISO

> **Attention à l'encodage :** le caractère `+` devient `%2B`

### Exemple

```
/salles/disponibles?debut=2024-11-04T08:00:00%2B01:00&fin=2024-11-04T09:00:00%2B01:00
```

### Réponse (format JSON)

```json
[
    {
        "id": ID DE LA SALLE (CHAINE),
        "nom_salle": NOM DE LA SALLE (CHAINE),
        "places_assises": PLACES ASSISES (NOMBRE ENTIER),
        "batiment": NOM DU BATIMENT (CHAINE)
    },
    ...
]
```

## `/salles/edt`

### Rôle

Renvoie l'emploi du temps d'une salle pendant une période donnée.

### Paramètres

 - `id` : l'id de la salle
 - `debut` : une date au format ISO
 - `fin` : une date au format ISO

> **Attention à l'encodage :** le caractère `+` devient `%2B`

### Exemple

```
/salles/edt?id=672901cd13546ff7b6eeb466&debut=2024-11-04T00:00:00%2B01:00&fin=2024-11-04T18:00:00%2B01:00
```

### Réponse (format JSON)

```json
[
    {
        "id_salle": ID DE LA SALLE (CHAINE),
        "id": ID DU COURS (CHAINE),
        "debute_a": DATE DE DEBUT DU COURS (CHAINE),
        "fini_a": DATE DE FIN DU COURS (CHAINE),
        "professeur": NOM DU PROFESSEUR (CHAINE),
        "module": NOM DU MODULE (CHAINE),
        "groupe": NOM DU GROUPE (LISTE DE CHAINES)
    },
    ...
]
```