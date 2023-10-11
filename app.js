var sqlite3 = require('sqlite3')
var express = require('express')
var app = express()
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

const secretKey = 'vishesh';

app.get('/',function(req,res) {
    res.json("Hi welcome")
})

app.use((req,res,next) => {
    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization")
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, PUT, DELETE, OPTIONS")
    next();
})

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false}))

app.get('/getQuestions', function(req,res) {

    const db = new sqlite3.Database('questions.db');
    
    db.all('SELECT * FROM questions', (err, rows) => {
        if (err) {
            console.error(err);
            return;
        }
        res.json(rows);
    });

    db.close()

});

app.get('/getAnswer', function(req,res) {

    const db = new sqlite3.Database('answers.db');
    
    db.all('SELECT * FROM answers', (err, rows) => {
        if (err) {
            console.error(err);
            return;
        }
        res.json(rows);
    });

    db.close()

});

app.get('/getStudents', function(req,res) {

    const db = new sqlite3.Database('students.db');
    
    db.all('SELECT * FROM students', (err, rows) => {
        if (err) {
            console.error(err);
            return;
        }
        res.json(rows);
    });

    db.close()

});

app.post('/postAnswers', function(req,res) {
    const data = req.body;
    const db = new sqlite3.Database('answers.db');

    try {
          for (const answer of data) {
            db.run(`
              INSERT INTO answers (email, question, selected, correct, ques_type) VALUES (?, ?, ?, ?, ?)
            `, [answer.email, answer.question, answer.selected, answer.correct, answer.ques_type]);
          }
          res.status(200).send(JSON.stringify({ message: 'Answers saved successfully!'}));
      } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
      }

    db.close()

});

app.post('/postStudents', function(req,res) {

    const data = req.body;
    const db = new sqlite3.Database('students.db');
    try {
            db.run(`
        INSERT INTO students (name, qualification, passedout, email, phonenumber, password) VALUES (?, ?, ?, ?, ?, ?)
        `, [data.name, data.qualification, data.passedout, data.email, data.phone, data.password]);

        res.status(200).send(JSON.stringify({ message: 'Student details saved successfully!' }));

    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
    db.close()
});

app.post('/checkEmail', function (req, res) {
    const data = req.body;
    const db = new sqlite3.Database('students.db');
    db.get('SELECT COUNT(*) AS count FROM students WHERE email = ?', [data.email], (err, row) => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
            db.close(); // Close the database connection in case of an error
            return;
        }
        if (row.count > 0) {
            res.status(200).send(JSON.stringify({ exists: true }));
        } else {
            res.status(200).send(JSON.stringify({ exists: false }));
        }

        db.close(); // Close the database connection after the query is complete
    });
});


app.post('/checkStudents', function(req,res) {
        const data = req.body;
        const db = new sqlite3.Database('students.db');

        const token = jwt.sign({ data }, secretKey, { expiresIn: '1h' });
        if(data.email === 'Vishesh@gmail.com' && data.password == 'Vishesh@123'){
            res.status(200).send(JSON.stringify({ message: 'Correct credentials' ,token: token, role: 'Admin'}));
        } else{
            try {
                db.get(
                    'SELECT * FROM students WHERE email = ? AND password = ?',
                    [data.email, data.password],
                    (err, row) => {
                        if (err) {
                            console.error(err);
                            res.status(500).send('Internal Server Error');
                        } else if (row) {
                            const token = jwt.sign({ row }, secretKey, { expiresIn: '1h' });
                            res.status(200).send(JSON.stringify({ message: 'Correct credentials' ,token: token, role: 'User'}));
                        } else {
                            res.status(401).send(JSON.stringify({ message: 'Not valid' }));
                        }
                        db.close();
                    }
                );
            } catch (error) {
                console.error(error);
                res.status(500).send('Internal Server Error');
                db.close();
            }
        }
});

app.post('/getStudents', function(req,res) {
    records = req.body
    const db = new sqlite3.Database('students.db');
    
    db.all('SELECT * FROM students limit ? OFFSET ?',records.records ,records.records-10, (err, rows) => {
        if (err) {
            console.error(err);
            return;
        }
        res.json(rows);
    });

    db.close()
});

app.get('/getStudent', function(req,res) {

    const db = new sqlite3.Database('students.db');
    
    db.all('SELECT COUNT(*) AS count FROM students', (err, rows) => {
        if (err) {
            console.error(err);
            return;
        }
        res.json(rows);
    });

    db.close()

});

app.post('/getAnswers', function(req,res) {

    var data = req.body
    const db = new sqlite3.Database('answers.db');
    
    db.all('SELECT * FROM answers where email = ? limit 25', [data.email], (err, rows) => {
        if (err) {
            console.error(err);
            return;
        }
        res.json(rows);
    });

    db.close()

});

app.post('/checkTestAttempted', function(req,res) {

    var data = req.body
    const db = new sqlite3.Database('answers.db');
    
    db.all('SELECT * FROM answers where email = ?',[data.email], (err, rows) => {
        if (err) {
            console.error(err);
            return;
        }
        if(rows.length > 0){
            res.status(200).send(JSON.stringify({ message: 'Attempted' }));
        }
        else {
            res.status(200).send(JSON.stringify({ message: 'Not attempted' }));
        }
    });

    db.close()

});


app.listen(3000)



// const db = new sqlite3.Database('questions.db');


// // const questions = [
// //     {
// //     name: 'I do not always tell the truth',
// //     option1: 'True',
// //     option2: 'False',
// //     correct: 'True',
// //     ques_type: 'Sychometric'
// //   },{
// //     name: 'I usually feel that life is worthwhile',
// //     option1: 'True',
// //     option2: 'False',
// //     correct: 'True',
// //     ques_type: 'Sychometric'
// //   },{
// //     name: 'I do not like to study about things that i am working at',
// //     option1: 'True',
// //     option2: 'False',
// //     correct: 'True',
// //     ques_type: 'Sychometric'
// //   },{
// //     name: 'I am not afraid to money',
// //     option1: 'True',
// //     option2: 'False',
// //     correct: 'True',
// //     ques_type: 'Sychometric'
// //   },{
// //     name: 'I have been quite independent and free from family rule',
// //     option1: 'True',
// //     option2: 'False',
// //     correct: 'True',
// //     ques_type: 'Sychometric'
// //   },{
// //     name: 'A group of words that makes complete sense or gives complete meaning is called a ___.',
// //     option1: 'Clause',
// //     option2: 'Communication',
// //     option3: 'Pharse',
// //     option4: 'Sentence',
// //     correct: 'Sentence',
// //     ques_type: 'Communication'
// //   },{
// //     name: 'Listening is an ___ process.',
// //     option1: 'Active',
// //     option2: 'Passive',
// //     option3: 'Inactive',
// //     option4: 'None of the above',
// //     correct: 'Active',
// //     ques_type: 'Communication'
// //   },{
// //     name: 'In a business letter, ___ indicates to the reader of the letter, what the letter is about.',
// //     option1: 'Subject',
// //     option2: 'Head',
// //     option3: 'Date',
// //     option4: 'Reference',
// //     correct: 'Subject',
// //     ques_type: 'Communication'
// //   },{
// //     name: 'The name and address of the person you are writing to in a formal letter come in ___ part of the letter.',
// //     option1: 'Margin',
// //     option2: 'Heading',
// //     option3: 'Salutation',
// //     option4: 'Body',
// //     correct: 'Heading',
// //     ques_type: 'Communication'
// //   },{
// //     name: 'The English ___ won the world cup.',
// //     option1: 'Is',
// //     option2: 'Has',
// //     option3: 'Have',
// //     option4: 'Are',
// //     correct: 'Have',
// //     ques_type: 'Communication'
// //   },{
// //     name: 'Look at this series: 36, 34, 30, 28, 24, …..what number should come next?',
// //     option1: '20',
// //     option2: '22',
// //     option3: '23',
// //     option4: '26',
// //     correct: '22',
// //     ques_type: 'General Aptitude'
// //   },{
// //     name: 'Look at this series: 7,10, 8,11, 9, 12, … what number should come next?',
// //     option1: '7',
// //     option2: '10',
// //     option3: '12',
// //     option4: '13',
// //     correct: '10',
// //     ques_type: 'General Aptitude'
// //   },{
// //     name: 'SCD, TEF, UGH, _______, WKL',
// //     option1: 'CMN',
// //     option2: 'UJI',
// //     option3: 'VIJ',
// //     option4: 'IJT',
// //     correct: 'VIJ',
// //     ques_type: 'General Aptitude'
// //   },{
// //     name: 'B2CD, ____, BCD4, B5CD, BC6D',
// //     option1: 'B2C2D',
// //     option2: 'BC3D',
// //     option3: 'B2C3D',
// //     option4: 'BCD7',
// //     correct: 'BC3D',
// //     ques_type: 'General Aptitude'
// //   },{
// //     name: 'Statement: “In order to bring punctuality in our office, we must provide conveyance allowance to our employees.” – in charge of a company tells Personal Manager. Assumptions: I. Conveyance allowance will not help in bringing punctuality. II. Displine and reward should always go hand in hand.',
// //     option1: 'Only assumption I is implicit.',
// //     option2: 'Only assumption II is implicit.',
// //     option3: 'Netiher I nor II is implicit.',
// //     option4: 'Both I nor II is implicit.',
// //     correct: 'Only assumption II is implicit.',
// //     ques_type: 'General Aptitude'
// //   },{
// //     name: 'Which of the following is not a correct variable ques_type?',
// //     option1: 'float',
// //     option2: 'int',
// //     option3: 'real',
// //     option4: 'double',
// //     correct: 'real',
// //     ques_type: 'Programming'
// //   },{
// //     name: 'What punctuation ends most lines of C code?',
// //     option1: ':',
// //     option2: ';',
// //     option3: '!',
// //     option4: '.',
// //     correct: ';',
// //     ques_type: 'Programming'
// //   },{
// //     name: 'What is the only function all C programs must contain?',
// //     option1: 'start()',
// //     option2: 'main()',
// //     option3: 'system()',
// //     option4: 'program()',
// //     correct: 'main()',
// //     ques_type: 'Programming'
// //   },{
// //     name: 'Which of the following is a logical NOT operator?',
// //     option1: '!',
// //     option2: '&',
// //     option3: '&&',
// //     option4: 'All of the above',
// //     correct: '!',
// //     ques_type: 'Programming'
// //   },{
// //     name: 'What punctuation is used to signal the beginning and end of code blocks?',
// //     option1: '{}',
// //     option2: '> and <',
// //     option3: 'BEGIN and END',
// //     option4: '()',
// //     correct: '{}',
// //     ques_type: 'Programming'
// //   },{
// //     name: 'What does SQL is used to perform operations on?',
// //     option1: 'Update Records',
// //     option2: 'Insert Records',
// //     option3: 'Both A and B',
// //     option4: 'None of the above',
// //     correct: 'Both A and B',
// //     ques_type: 'Database'
// //   },{
// //     name: 'What does SQL stand for?',
// //     option1: 'SQL stands for Sample Query Language',
// //     option2: 'SQL stands for Structured Query List',
// //     option3: 'SQL stands for Structured Query Language',
// //     option4: 'SQL stands for Sample Query List',
// //     correct: 'SQL stands for Structured Query Language',
// //     ques_type: 'Database'
// //   },{
// //     name: 'What does this SQL database language design to?',
// //     option1: 'Maintain the data in hierarchal database management systems.',
// //     option2: 'Maintain the data in relational database management systems.',
// //     option3: 'Maintain the data in network database management systems.',
// //     option4: 'Maintain the data in object-oriented database management systems.',
// //     correct: 'Maintain the data in relational database management systems.',
// //     ques_type: 'Database'
// //   },{
// //     name: 'SQL became the standard of?',
// //     option1: 'ANSCII',
// //     option2: 'ANSI',
// //     option3: 'ISO',
// //     option4: 'Both B and C',
// //     correct: 'Both B and C',
// //     ques_type: 'Database'
// //   },{
// //     name: 'Which statement is not true about SQL?',
// //     option1: 'Using SQL in relational databases is all about inserting, updating, and deleting data.',
// //     option2: 'Sample data can also be described with the aid of this tool.',
// //     option3: 'It helps develop relational database functions, events, and views.',
// //     option4: 'A SQL user can also set restrictions and permissions for a table column, a view, and a stored procedure.',
// //     correct: 'Sample data can also be described with the aid of this tool.',
// //     ques_type: 'Database'
// //   }
// // ];

// // for (const question of questions) {
// //     console.log('goingg');
// //     db.run(`
// //   INSERT INTO questions (question, option1, option2, option3, option4, correct, ques_type) VALUES (?, ?, ?, ?, ?, ?,?)
// //   `, [question.name, question.option1, question.option2, question.option3, question.option4, question.correct, question.ques_type]);
// // }

// data = db.run('SELECT * FROM questions');

// console.log('dataaaaaaaa',data);

// // db.run(`
// // CREATE TABLE IF NOT EXISTS answers (
// //     id INTEGER PRIMARY KEY AUTOINCREMENT,
// //     email TEXT NOT NULL,
// //     question TEXT NOT NULL,
// //     selected TEXT NOT NULL,
// //     correct TEXT NOT NULL,
// //     ques_type TEXT NOT NULL
// // );
// // `);
 
// // db.run(`
// // CREATE TABLE IF NOT EXISTS students (
// //     id INTEGER PRIMARY KEY AUTOINCREMENT,
// //     name TEXT NOT NULL,
// //     qualification TEXT NOT NULL,
// //     passedout INTEGER NOT NULL,
// //     email TEXT NOT NULL,
// //     phoenumber BIGINT NOT NULL,
// //     password TEXT NOT NULL
// // );
// // `);
 

// // db.run(`
// // CREATE TABLE IF NOT EXISTS questions (
// //     id INTEGER PRIMARY KEY AUTOINCREMENT,
// //     question TEXT NOT NULL,
// //     option1 TEXT NOT NULL,
// //     option2 TEXT NOT NULL,
// //     option3 TEXT,
// //     option4 TEXT,
// //     correct TEXT NOT NULL,
// //     ques_type TEXT NOT NULL
// // );
// // `);





// // let mysql = require('mysql');
// // let config = require('./config.js');
// // var express = require('express')
// // var app = express()

// // app.get('/',function(req,res) {
// //     res.json("Hi welcome")
// // })

// // app.use((req,res,next) => {
// //     res.setHeader("Access-Control-Allow-Origin", "*")
// //     res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization")
// //     res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, PUT, DELETE, OPTIONS")
// //     next();
// // })

// // app.get('/getQuestions', function(req,res) {

// //     let connection = mysql.createConnection(config);
// //     connection.query('SELECT * FROM questions', (err, rows) => {
// //         if (err) {
// //             console.error(err);
// //             return;
// //         }
// //         res.json(rows);
// //     });

// //     connection.end()

// // });

// // app.get('/getAnswers', function(req,res) {

// //     let connection = mysql.createConnection(config);
// //     connection.query('SELECT * FROM answers', (err, rows) => {
// //         if (err) {
// //             console.error(err);
// //             return;
// //         }
// //         res.json(rows);
// //     });

// //     connection.end()

// // });

// // app.get('/getStudents', function(req,res) {

// //     let connection = mysql.createConnection(config);
// //     connection.query('SELECT * FROM students', (err, rows) => {
// //         if (err) {
// //             console.error(err);
// //             return;
// //         }
// //         res.json(rows);
// //     });

// //     connection.end()

// // });

// // app.post('/postAnswers', function(req,res) {
// //     console.log(req.body);
// //     const data = req.body;

// //     let connection = mysql.createConnection(config);
    
// //     for (const answer of data) {
// //         connection.query(`
// //       INSERT INTO answers (email, question, selected, correct, ques_type) VALUES (?, ?, ?, ?, ?)
// //       `, [answer.email, answer.question, answer.selected, answer.correct, answer.ques_type]);
// //     }

// //     connection.end()

// // });

// // app.post('/postStudents', function(req,res) {

// //     const studentsData = req.body;

// //     let connection = mysql.createConnection(config);
    
// //     for (const data of studentsData) {
// //         connection.query(`
// //       INSERT INTO students (name, qualification, passedout, email, phoenumber, password) VALUES (?, ?, ?, ?, ?, ?)
// //       `, [data.name, data.qualification, data.passedout, data.email, data.phonenumber, data.password]);
// //     }

// //     connection.end()

// // });

// // app.listen(3000)