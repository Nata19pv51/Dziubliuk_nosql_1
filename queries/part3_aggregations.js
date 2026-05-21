db = db.getSiblingDB('spotify');

// Завдання 1. Топ-10 виконавців за середньою популярністю
// Знайдіть виконавців, у яких є хоча б 5 треків. Для кожного виконавця порахуйте середню популярність його треків. 
// Потім відсортуйте за спаданням та виберіть топ-10 виконавців. Вивід повинен включати ім’я виконавця та його середню популярність.

const results = db.tracks.aggregate([
    { $unwind: "$artists" },

    {
        $group: {
            _id: "$artists",
            totalTracks: { $sum: 1 },
            avgPopularity: { $avg: "$popularity" }
        }
    },

    {
        $match: {
            totalTracks: { $gte: 5 }
        }
    },

    { $sort: { avgPopularity: -1 } },

    { $limit: 10 },

    {
        $project: {
            _id: 0,
            artist_name: "$_id",
            avgPopularity: { $round: ["$avgPopularity", 1 ] }
        }
    }
]).toArray();

print("Топ-10 виконавців за середньою популярністю:");
printjson(results);


// Завдання 2. Розподіл треків за настроєм
// Кожному треку присвойте настрій на основі двох полів: valence та energy:
// високий valence + висока energy → happy
// низький valence + висока energy → angry
// високий valence + низька energy → calm
// низький valence + низька energy → sad 
// Порахуйте, скільки треків потрапило до кожної категорії, та виведіть таблицю з настроєм і кількістю треків.
const results = db.tracks.aggregate([
    {
        $addFields: {
            mood: {
                $switch: {
                    branches: [
                        { 
                            case: { $and: [ { $gte: ["$audio_features.valence", 0.5] }, { $gte: ["$audio_features.energy", 0.5] } ] }, 
                            then: "happy" 
                        },
                        { 
                            case: { $and: [ { $lt: ["$audio_features.valence", 0.5] }, { $gte: ["$audio_features.energy", 0.5] } ] }, 
                            then: "angry" 
                        },
                        { 
                            case: { $and: [ { $gte: ["$audio_features.valence", 0.5] }, { $lt: ["$audio_features.energy", 0.5] } ] }, 
                            then: "calm" 
                        },
                        { 
                            case: { $and: [ { $lt: ["$audio_features.valence", 0.5] }, { $lt: ["$audio_features.energy", 0.5] } ] }, 
                            then: "sad" 
                        },
                    ],
                    default: "unknown"
                }
            }
        }
    },
    {
        $group: {
            _id: "$mood",
            count: { $sum: 1 }
        }
    },
    {
        $project: {
            _id: 0,
            mood: "$_id",
            count: "$count"
        }
    },
    {
        $sort: { count: -1 }
    }
]).toArray();

printjson(results);



// Завдання 3. Найбільш «танцювальний» жанр
const results = db.tracks.aggregate([
    {
        $group: {
            _id: "$track_genre",
            avg_danceability: { $avg: "$audio_features.danceability" },
            avg_energy: { $avg: "$audio_features.energy" },
            avg_valence: { $avg: "$audio_features.valence" },
            totalTracks: { $sum: 1 }
        }
    },
    { $match: { totalTracks: { $gte: 100 } } },
    { $sort: { avg_danceability: -1 } },
    { $limit: 1 },
    {
        $project: {
            _id: 0,
            track_genre: "$_id",
            avg_danceability: 1,
            avg_energy: 1,
            avg_valence: 1,
            totalTracks: 1
        }
    }
]).toArray();

print("Найбільш «танцювальний» жанр:");
printjson(results);
