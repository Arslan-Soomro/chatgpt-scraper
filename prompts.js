const topics = [
  "Climate Change",
  "Economy",
  "Education",
  "Environment",
  "Technology",
  "Healthcare",
  "Sports",
  "Politics",
  "Social Issues",
  "Science",
];

getTopicSpecificPrompt = function (topic) {
  return `Generate a 1000 word news article about ${topic}`;
};

function getPrompts() {
    const prompts = [];
    for (let topic of topics) {
        prompts.push(getTopicSpecificPrompt(topic));
    }
    return prompts;
}

module.exports = {
    getPrompts
}