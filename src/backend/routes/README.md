# Endpoints

## `/salles/disponibles`

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

### Paramètres

 - `id` : l'id de la salle

### Exemple

```
/salles/edt?id=6723b74ced9239c51b665102
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
        "groupe": NOM DU GROUPE (CHAINE)
    },
    ...
]
```