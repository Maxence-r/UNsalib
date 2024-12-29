# Endpoints

## `GET /api/rooms`

### Purpose

Returns all the rooms stored in the database with their associated information

### Parameters

None

### Example

```
/api/rooms
```

### Response (JSON format)

```json
[
    {
        "id": ROOM ID (STRING),
        "name": REAL NAME OF THE ROOM (STRING),
        "alias": ALIAS OF THE ROOM (STRING),
        "building": BUILDING NAME (STRING),
        "available": WHETHER THE ROOM IS CURRENTLY FREE (BOOLEAN),
        "features": FEATURES OF THE ROOM (STRINGS ARRAY)
    },
    ...
]
```

## `GET /api/rooms/available`

### Purpose

Returns the rooms available over a specified period

### Parameters

 - `start` : the start date in ISO format
 - `end` : the end date in ISO format
 - *(OPTIONAL) `blackboards` : the minimum number of black boards*
 - *(OPTIONAL) `whiteboards` : the minimum number of white boards*
 - *(OPTIONAL) `type` : the type of room*
 - *(OPTIONAL) `features` : room features in `feature1-feature2` format*

> **Pay attention to date encoding :** the `+` character becomes `%2B`

### Example

```
/api/rooms/available?start=2024-12-29T18%3A32%3A00%2B01%3A00&end=2024-12-29T19%3A32%3A00%2B01%3A00&type=td&seats=6&whiteboards=1
```

```
/api/rooms/available?start=2024-12-29T18%3A32%3A00%2B01%3A00&end=2024-12-29T19%3A32%3A00%2B01%3A00&type=amphi&features=visio-ilot&seats=2&whiteboards=1&blackboards=1
```

### Response (JSON format)

```json
[
    {
        "id": ROOM ID (STRING),
        "name": REAL NAME OF THE ROOM (STRING),
        "alias": ALIAS OF THE ROOM (STRING),
        "building": BUILDING NAME (STRING),
        "available": WHETHER THE ROOM IS CURRENTLY FREE (BOOLEAN),
        "features": FEATURES OF THE ROOM (STRINGS ARRAY)
    },
    ...
]
```

## `GET /api/rooms/timetable`

### Purpose

Returns a room's timetable for a given week (by default, the current week)

### Parameters

 - `id` : the room id
 - *(OPTIONAL) `increment` : a number to add to the current week number*

### Example

```
/api/rooms/timetable?id=672901cd13546ff7b6eeb466&increment=2
```

```
/api/rooms/timetable?id=672901cd13546ff7b6eeb466
```

### Response (JSON format)

```json
{
    "courses": [
        {
            "courseId": COURSE ID (STRING),
            "start": COURSE START DATE (STRING),
            "end": COURSE END DATE (STRING),
            "duration": COURSE DURATION IN PERCENTAGE (1h = 100%) (INTEGER),
            "overflow": PERCENTAGE OF MINUTES OVERFLOW (NEGATIVE OR POSITIVE DEPENDING ON WHETHER THE PREVIOUS OR NEXT HOUR IS THE CLOSEST) (INTEGER),
            "roomId": ROOM ID (STRING),
            "teacher": TEACHER'S NAME (STRING),
            "module": MODULE'S NAME (STRING),
            "group": NAME(S) OF ASSOCIATED GROUP(S) (STRINGS ARRAY),
            "color": COURSE COLOR (STRING)
        },
        ...
    ],
    "weekInfos": {
        "start": START DATE OF THE WEEK (STRING),
        "end": END DATE OF THE WEEK (STRING),
        "number": NUMBER OF THE WEEK (INTEGER)
    }
}
```

## `GET /api/app/version`

### Purpose

Returns the current version of the application

### Parameters

None

### Example

```
/api/app/version
```

### Response (JSON format)

```json
{
    "version": VERSION OF THE APPLICATION (STRING)
}
```