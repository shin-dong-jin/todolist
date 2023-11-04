const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const MongoClient = require('mongodb').MongoClient;
app.set('port', 5000);

app.use('/static', express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

let db;
connectDB = () => {
    let databaseURL = 'mongodb://127.0.0.1:27017';
    MongoClient.connect(databaseURL, { useUnifiedTopology: true }, function (err, database) {
        if (err) {
            throw err;
        }
        console.log('데이터베이스에 연결되었습니다.: ' + databaseURL);
        db = database.db('todo');
    });
};

app.get('/', (req, res) => {
    res.redirect('todo/list');
});

app.get('/todo/list', (req, res) => {
    if (db) {
        db.collection('todolist').find({}).toArray(function (findErr, result) {
            if (findErr) {
                throw findErr;
            }
            req.app.render('todo/list', { todoList: result }, (err, html) => {
                if (err) {
                    throw err;
                }
                res.end(html);
            });
        });
    }
});

app.post('/todo/list', (req, res) => {
    let todo = {
        no: parseInt(req.body.no),
        title: req.body.title,
        done: false
    }
    if (db) {
        db.collection('todolist').insertOne(todo);
        res.sendStatus(200);
    }
});

app.delete('/todo/list', (req, res) => {
    if (db) {
        db.collection('todolist').deleteOne({ no: parseInt(req.body.no) });
        res.sendStatus(200);
    }
});

app.put('/todo/list/title', (req, res) => {
    if (db) {
        db.collection('todolist').updateOne({ no: parseInt(req.body.no) }, { '$set': { 'title': req.body.title } });
        res.sendStatus(200);
    }
});

app.put('/todo/list/done', (req, res) => {
    if (db) {
        db.collection('todolist').updateOne({no: parseInt(req.body.no)}, {'$set': {'done': Boolean(req.body.done)}})
        res.sendStatus(200);
    }
});

app.listen(app.get('port'), () => {
    console.log('[:5000] Server is running...');
    connectDB();
});