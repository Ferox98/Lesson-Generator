const Parse = require('parse/node');
require('dotenv').config();

Parse.initialize(process.env.APP_ID, process.env.JAVASCRIPT_ID);
Parse.serverURL = process.env.PARSE_SERVER_URL;

exports.prompt_list = async (req, res) => {
    const Prompt = Parse.Object.extend('Prompt');
    const promptQuery = new Parse.Query(Prompt);
    promptQuery.find()
            .then((obj) => res.json(obj))
            .catch((err) => res.json(err))
}

exports.add_prompt = async (req, res) => {
    const Prompt = Parse.Object.extend('Prompt');
    const prompt = new Prompt();
    prompt.set('Subject', req.body.Subject);
    prompt.set('Difficulty', req.body.Difficulty);
    prompt.set('Type', req.body.Type);
    prompt.set('Prompt', req.body.Prompt);
    if (req.body.Chapter !== undefined) {
        prompt.set('Chapter', req.body.Chapter);
    }
    prompt.save()
            .then((prompt) => res.json(prompt))
            .catch(error => res.json(error));
}

