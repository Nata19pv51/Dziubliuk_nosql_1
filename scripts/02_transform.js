// 1. Створити нову колекцію tracks:
// Використовуємо базу даних spotify
db = db.getSiblingDB('spotify');

// Видаляємо стару колекцію tracks, якщо вона існує
db.tracks.drop();

db.tracks_raw.aggregate([
    {
        $project: {
            _id: 0,
            track_id: 1,
            track_name: 1,
            album_name: 1,
            explicit: 1,
            popularity: 1,
            duration_ms: 1,
            track_genre: 1,
            
            artists: { 
                $map: {
                    input: { $split: ["$artists", ";"] },
                    as: "a",
                    in: { $trim: { input: "$$a" } }
                }
            },

            audio_features: {
                danceability: "$danceability", 
                energy: "$energy", 
                loudness: "$loudness", 
                speechiness: "$speechiness", 
                acousticness: "$acousticness", 
                instrumentalness: "$instrumentalness", 
                liveness: "$liveness", 
                valence: "$valence", 
                tempo: "$tempo", 
                key: "$key", 
                mode: "$mode", 
                time_signature: "$time_signature"
            },
            
            duration_sec: { $round: [{ $divide: [ "$duration_ms", 1000 ]}, 1 ]},
            
            popularity_tier: {
                $cond: {
                    if: { $gte: ["$popularity", 70] },
                    then: "high",
                    else: {
                        $cond: {
                        if: { $lt: ["$popularity", 40] },
                        then: "low",
                        else: "medium"
                        }
                    }
                }
            }
            
            
        }
    },

    { $out: "tracks" }
]);

print("Кількість документів у tracks:", db.tracks.countDocuments());
print("один приклад документа для перевірки структури:\n", db.tracks.findOne());