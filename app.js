const express = require('express');

const app = express();

var lessonController = require('./Controllers/LessonController');
var subtopicController = require('./Controllers/SubtopicController');
var promptController = require('./Controllers/PromptController');

app.use(express.json());

app.post('/prompts', promptController.prompt_list);

app.post('/prompts/submit', promptController.add_prompt);

app.post('/lessons', lessonController.get_lessons);

app.post('/subtopics', subtopicController.subtopic_list);

app.post('/subtopics/submit', subtopicController.add_subtopic);

const port = process.env.PORT || 4000

app.listen(port, ()=> {
    console.log('server is running on port ', port);
})