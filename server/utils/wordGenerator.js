const dictionary = [
  "apple", "book", "car", "dog", "sun", "tree", "flower", "cup", "chair", "ball",
  "fish", "hat", "star", "moon", "cloud", "door", "key", "pencil", "smile", "heart",
  "airplane", "banana", "camera", "guitar", "mountain", "pizza", "rocket", "spider", "turtle", "umbrella",
  "bicycle", "cactus", "dolphin", "grapes", "ice cream", "robot", "snowman", "volcano", "watch", "whale"
];

// NEW FUNCTION: Get 3 unique random words
const getWordOptions = () => {
  const options = [];
  while (options.length < 3) {
    const random = dictionary[Math.floor(Math.random() * dictionary.length)];
    if (!options.includes(random)) {
      options.push(random);
    }
  }
  return options;
};

module.exports = { getWordOptions };