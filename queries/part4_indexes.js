db = db.getSiblingDB('spotify');

// Завдання 1. Аналіз запиту та індексація
// Статистика БЕЗ індексу:
const statsBefore = db.tracks.find({
  track_genre: "pop",
  "audio_features.danceability": { $gte: 0.7 }
}).sort({ popularity: -1 }).explain("executionStats");

print("******************* Статистика ДО створення індексу **********************");
printjson(statsBefore.executionStats);

// 2. Створення індексу:
db.tracks.createIndex({ 
    track_genre: 1, 
    popularity: -1, 
    "audio_features.danceability": 1 
});
print("******************** Індекс створено успішно **************************");

// 3. Статистика ПІСЛЯ створення індексу
const statsAfter = db.tracks.find({
  track_genre: "pop",
  "audio_features.danceability": { $gte: 0.7 }
}).sort({ popularity: -1 }).explain("executionStats");

print("***************** Статистика ПІСЛЯ створення індексу ******************");
printjson(statsAfter.executionStats);


// Завдання 2. Індекс для інших полів
// Припустимо, що ви часто шукаєте музику для роботи, використовуючи поля audio_features.instrumentalness, 
// audio_features.speechiness та explicit. 
// Щоб такі запити виконувалися ефективно, створіть складений індекс за цими полями та 
// за допомогою explain() покажіть, що він використовується при виконанні пошуку.
db.tracks.createIndex({ 
    explicit: 1,
    "audio_features.instrumentalness": -1,
    "audio_features.speechiness": 1
});
print("******************** Індекс створено успішно **************************");

const statsAfter = db.tracks.find({
  explicit: true,
  "audio_features.speechiness": { $lte: 0.2 }
}).sort({ "audio_features.instrumentalness": -1 }).explain("executionStats");

print("***************** Статистика ПІСЛЯ створення індексу ******************");
printjson(statsAfter.executionStats);


// Завдання 3. Покривний запит
// див. README file