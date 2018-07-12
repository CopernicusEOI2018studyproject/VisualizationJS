// Load the application's configuration
const config = require('./config');

// Required
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fse = require('fs-extra');
const debug = require('debug')('server')
const colors = require('colors')
const cors = require('cors')

const app = express();
const datasetPath = './../datasets';

app.use(express.static("./../datasets"));

// enable processing of the received post content
app.use(bodyParser.urlencoded({extended: true})); // to enable processing of the received post content

var corsOptions = {
    origin: '*',
    allowedHeaders: ['Content-Type', 'Authorization', 'Content-Length', 'X-Requested-With', 'Accept'],
    methods: ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS'],
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
 }
 app.use(cors(corsOptions));

// --------------------------------------------------

// code which is executed on every request
app.use(function(req, res, next) {
    console.log(req.method + ' ' + req.url + ' was requested by ' + req.connection.remoteAddress);
    res.header('Access-Control-Allow-Origin', '*');    // allow CORS
    next();
});

// Start the web server
app.listen(config.express_port, function() {
    console.log('------------------------------------------------------------');
    console.log('  Express server listening on port', config.express_port.toString().cyan);
    console.log('------------------------------------------------------------');
});

/* Read file by path. */
app.get('/*', function(req, res) {

    // res.header('Access-Control-Allow-Origin', '*');    // allow CORS

    let fileName = req.url.substring(5, req.url.length);
    let passon = {
        url: req.url,
        filePath: path.join(datasetPath, fileName),
        file: fileName
    };

    return readDataset(passon)
        .then((passon) => {
            debug('Finished reading file: [%s]', passon.file);
            res.status(200).send(passon.output);
        })
        .catch(err => {
            debug('Error reading file: [%s]\n[%s]', passon.file, JSON.stringify(err));
            let status = 500;
            if (err.status) {
                status = err.status;
            }
            let msg = 'Internal error';
            if (err.msg) {
                msg = err.msg;
            }
            res.status(status).send({ error: msg });
        });
});

function readDataset(passon) {
    return new Promise((fulfill, reject) => {
        // console.log(fse.readdirSync(datasetPath));
        try {
            debug('Checking path: [%s]', passon.filePath);
            // var folder = fse.readdirSync(path);
            var exists = fse.existsSync(passon.filePath);

            if (exists) {
                let stations = fse.readJSONSync(passon.filePath, { throws: false });
                debug('Saving filecontent ...');
                passon.output = stations;
            } else {
                let err = new Error();
                err.status = 404;
                err.msg = 'File does not exist.';
                debug(err.msg);
                reject(err);
            }

            fulfill(passon);
        
        } catch (err) {
            debug('Error reading file');
            err.status = 404;
            err.msg = 'File does not exist.';
            debug(err.msg);
            reject(err);
        }
    });
}