const Parse = require('parse/node');
require('dotenv').config();
const got = require('got');

Parse.initialize(process.env.APP_ID, proces.env.JAVASCRIPT_ID);
Parse.serverURL = process.env.PARSE_SERVER_URL;

async function queryLessons(subject, difficulty) {
    const Lesson = Parse.Object.extend('Lesson');
    const lessonQuery = new Parse.Query(Lesson);
    lessonQuery.equalTo('Subject', subject);
    lessonQuery.equalTo('Difficulty', difficulty);
    lessonQuery.ascending('Chapter');
    const obj = await lessonQuery.find();
    return obj;
}

async function querySubtopics(subject, difficulty) {
    const Subtopic = Parse.Object.extend('Subtopic');
    // first check if subtopics for specified subject and difficulty exist
    const subtopicQuery = new Parse.Query(Subtopic);
    subtopicQuery.equalTo('Subject', subject);
    subtopicQuery.equalTo('Difficulty', difficulty);
    subtopicQuery.ascending('Chapter');
    const obj = await subtopicQuery.find();
    return obj;
}

async function findSubtopics(subject, difficulty) {
    let subtopics = await querySubtopics(subject, difficulty);
    if (subtopics.length == 0) {
        const prompt = await findPrompt(subject, difficulty, 'subtopic');
        subtopics = await generateSubtopics(prompt);
        const chapters = splitChapters(subtopics);
        chapters.forEach((chapter, idx) => {
            const Subtopic = Parse.Object.extend('Subtopic');
            const subtopic = new Subtopic();
            subtopic.set('Subject', subject);
            subtopic.set('Difficulty', difficulty);
            subtopic.set('Chapter', idx + 1);
            subtopic.set('Subtopic', chapter);
            subtopic.save();
        });
        return chapters;
    }
    else {
        let arr = []
        subtopics.forEach((subtopic) => {
            arr.push(subtopic.get('Subtopic'));
        });
        return arr;
    }
}

function splitChapters(chapters) {
    start = chapters.indexOf('1.');
    chapters = chapters.substr(start);
    // split by newline
    chapters_array = chapters.split('\n');
    return chapters_array;
}

async function findPrompt(subject, difficulty, type, chapter=null) {
    console.log(`${subject}, ${difficulty}, ${type}, ${chapter}`);
    const Prompt = Parse.Object.extend('Prompt');
    const promptQuery = new Parse.Query(Prompt);
    promptQuery.equalTo('Subject', subject);
    promptQuery.equalTo('Difficulty', difficulty);
    promptQuery.equalTo('Type', type);
    if (chapter !== null) {
        promptQuery.equalTo('Chapter', chapter.toString());
    }
    const res = await promptQuery.find();
    console.log(res);
    return res[0].get('Prompt');    
}

async function generateLesson(prompt) {
    console.log(prompt);
    const params = {
        "prompt": prompt,
        "max_tokens": 300,
        "temperature": 0.6,
        "frequency_penalty": 0.7
    };
    const headers = {
        "Authorization": `Bearer ${process.env.OPENAI_API_TOKEN}`,
        "Content-Type": "application/json"
    };
    console.log("Sending request");
    try {
        const response = await got.post(url, { json: params, headers: headers }).json();
        output = `${prompt}${response.choices[0].text}`;
        console.log(output);
        return output;
    } catch (error) { console.log(error); }
}

exports.get_lessons = async (req, res) => {
    let lessons = await queryLessons(req.body.Subject, req.body.Difficulty);
    if (lessons.length == 0) {
        let subtopics = await findSubtopics(req.body.Subject, req.body.Difficulty);
        let lessons = []; 
        subtopics.forEach(async (subtopic, idx) => {
            let prompt = await findPrompt(req.body.Subject, req.body.Difficulty, 'lesson', idx + 1);
            const lesson = await generateLesson(prompt);
            lessons.push(lesson);
            // save lesson
            const Lesson = Parse.Object.extend('Lesson');
            less = new Lesson();
            less.set('Subject', req.body.Subject);
            less.set('Difficulty', req.body.Difficulty);
            let chapter = idx + 1;
            less.set('Chapter', chapter.toString());
            less.set('Lesson', lesson);
            less.save();
        });

        res.json(lessons);
    }
    // if they don't, find subtopics and prompts for those subtopics
    else {
        let arr = [];
        lessons.forEach((lesson) => {
            arr.push(lesson.get('Lesson'));
        })
        res.json(arr);
    }
}