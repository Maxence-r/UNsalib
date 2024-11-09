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
        "nom": NOM DE LA SALLE (CHAINE),
        "places_assises": PLACES ASSISES (NOMBRE ENTIER),
        "batiment": NOM DU BATIMENT (CHAINE),
        "disponible": LA SALLE EST ACTUELLEMENT LIBRE (BOOLEEN)
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
        "nom": NOM DE LA SALLE (CHAINE),
        "places_assises": PLACES ASSISES (NOMBRE ENTIER),
        "batiment": NOM DU BATIMENT (CHAINE)
    },
    ...
]
```

## `/salles/edt`

### Rôle

Renvoie l'emploi du temps d'une salle pendant une semaine donnée (par défaut, la semaine actuelle).

### Paramètres

 - `id` : l'id de la salle
 - *(OPTIONNEL) `increment` : un nombre à ajouter au numéro de semaine actuel*

### Exemple

```
/salles/edt?id=672901cd13546ff7b6eeb466&increment=2
```

```
/salles/edt?id=672901cd13546ff7b6eeb466
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
            "id_salle": ID DE LA SALLE (CHAINE),
            "professeur": NOM DU PROFESSEUR (CHAINE),
            "module": NOM DU MODULE (CHAINE),
            "groupe": NOM DU(DES) GROUPE(S) ASSOCIE(S) (LISTE DE CHAINES)
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