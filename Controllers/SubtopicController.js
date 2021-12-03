const Parse = require('parse/node');
require('dotenv').config();

Parse.initialize(process.env.APP_ID, process.env.JAVASCRIPT_ID);
Parse.serverURL = process.env.PARSE_SERVER_URL;

exports.subtopic_list = async (req, res) => {
    const Subtopic = Parse.Object.extend('Subtopic');
    const subtopicQuery = new Parse.Query(Subtopic);
    subtopicQuery.find()
            .then((obj) => res.json(obj))
            .catch((err) => res.json(err))
}

exports.add_subtopic = async (req, res) => {
    const Subtopic = Parse.Object.extend('Subtopic');
    const subtopic = new Subtopic();
    subtopic.set('Subject', req.body.Subject);
    subtopic.set('Difficulty', req.body.Difficulty);
    subtopic.set('Type', req.body.Type);
    subtopic.set('Subtopic', req.body.subtopic);
    subtopic.set('Chapter', req.body.Chapter);
    
    subtopic.save()
            .then((subtopic) => res.json(subtopic))
            .catch(error => res.json(error));
}

