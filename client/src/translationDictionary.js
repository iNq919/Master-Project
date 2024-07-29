// translation-dictionary.js
const translationDictionary = {
  "a cat": "kot",
  "a dog": "pies",
  "a bird": "ptak",
  "a car": "samochód",
  "a person": "osoba",
  // Add more translations as needed
};

function translateToPolish(caption) {
  return translationDictionary[caption] || caption; // Return the translation or the original caption if not found
}
