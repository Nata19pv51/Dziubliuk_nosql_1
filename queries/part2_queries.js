db = db.getSiblingDB('spotify');

// Завдання 1. Треки для вечірки
// Такі треки повинні мати високий danceability (вище 0.7) та високу енергію (також вище 0.7), а тривалість — від 3 до 5 хвилин (180000–300000 мс).
print("*********************** Завдання 1 *************************")
const result_1 = db.tracks.aggregate([
    {
        $match: {
            "audio_features.danceability": { $gt: 0.7 },
            "audio_features.energy": { $gt: 0.7 },
            duration_ms: { $gte: 180000, $lte: 300000 }
        }
    },
    {
        $project: {
            _id: 0,
            track_id: 1,
            track_name: 1,
            "audio_features.danceability": 1,
            "audio_features.energy": 1,
            duration_ms: 1 
        }
    }
    ]).toArray();

print("Треки для вечірки:");
printjson(result_1);
print("Кількість знайдених треків:", result_1.length);


// Завдання 2. Виконавці, у яких усі треки популярні
// У артиста є мінімум 3 треки і при цьому мінімальна популярність цих треків становить 60% або вище.
// Знайти топ-20 таких артистів, вивести ім’я артиста, кількість треків, мінімальну та середню популярність з точністю до одного знака після коми
print("*********************** Завдання 2 *************************")
const result_2 = db.tracks.aggregate([
    { $unwind: "$artists" },

    {
        $group: {
            _id: "$artists",
            totalTracks: { $sum: 1 },
            minPopularity: { $min: "$popularity" },
            avgPopularity: { $avg: "$popularity" }
        }
    },

    {
        $match: {
            totalTracks: { $gte: 3 },
            minPopularity: { $gte: 60 }
        }
    },

    { $sort: { avgPopularity: -1 } },

    { $limit: 20 },

    {
        $project: {
            _id: 0,
            artist_name: "$_id",
            totalTracks: 1,
            minPopularity: { $round: [ { $min: "$minPopularity" }, 1 ] },
            avgPopularity: { $round: [ { $avg: "$avgPopularity" }, 1 ] }
        }
    }
]).toArray();

print("Топ-20 популярних артистів:");
printjson(result_2);


// Завдання 3. Нетипові треки
print("*********************** Завдання 3 *************************")
const result_3 = db.tracks.aggregate([
    {
        $group: {
            _id: "$track_genre",
            avg_tempo: { $avg: "$audio_features.tempo" },
            stdDev: { $stdDevPop: "$audio_features.tempo" },
            all_tracks: {
                $push: {
                    _id: "$_id",
                    track_name: "$track_name",
                    popularity: "$popularity",
                    artists: "$artists",
                    audio_features: { tempo: "$audio_features.tempo" }
                }
            }
        }
    },
    {
        $addFields: {
        outlier_threshold: {
            $add: [ "$avg_tempo", { $multiply: [2, "$stdDev"] } ]
        }
    }
    },
    {
        $project: {
            _id: 0,
            avg_tempo: { $round: ["$avg_tempo", 1] },
            genre: "$_id",
            outlier_threshold: { $round: ["$outlier_threshold", 1] },
            outlier_tracks: {
                $filter: {
                    input: "$all_tracks",
                    as: "track",
                    cond: { $gt: ["$$track.audio_features.tempo", "$outlier_threshold"] }
                }
            }
        }
    },

    {
        $match: {
            outlier_tracks: { $ne: [] }
        }
    }
]).toArray();

printjson(result_3);



// Завдання 4: Треки для фонової роботи
// Знайдіть треки: тихі (loudness < -10), з низькою мовленнєвою складовою (speechiness < 0,1), 
// переважно інструментальні (instrumentalness > 0,5) і не містять explicit-контенту
print("*********************** Завдання 4 *************************")
const result_4 = db.tracks.aggregate([
    { 
        $match: {
            "audio_features.loudness": {$lt: -10},
            "audio_features.speechiness": {$lt: 0.1},
            "audio_features.instrumentalness": {$gt: 0.5},
            explicit: false
        }
    },
    {
        $project:{
            _id: 0,
            track_name: 1,
            loudness: "$audio_features.loudness",
            speechiness: "$audio_features.speechiness",
            instrumentalness: "$audio_features.instrumentalness"
        }
    }
]).toArray();

printjson(result_4.slice(0, 5));
print("Кількість фонових треків: ", result_4.length);