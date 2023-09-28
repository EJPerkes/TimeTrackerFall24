const { json } = require('body-parser');

const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database/main.db');

exports.GetAllProjectsForUser = (req, res) => {
    console.log("ProjectControllers.js file/GetAllProjectsForUser route called");

    let userID = req.params["userID"];
    console.log(`userID: ${userID}`);

    let sql = `SELECT DISTINCT p.projectName, p.projectID, p.description, c.courseName
        FROM Projects as p
        INNER JOIN Courses as c ON c.courseID = p.courseID
        INNER JOIN Course_Users as cu ON cu.CourseID = c.courseID
        INNER JOIN Users as u on u.userID = ?
        INNER JOIN Project_Users as pu on pu.userID = u.userID AND pu.projectID = p.projectID`;

    db.all(sql, [userID], (err, rows) => {
        if (err) {
            return res.status(500).json({ message: 'Something went wrong. Please try again later.' });
        }
        if (rows) {
            console.log(`Rows retrieved:  ${JSON.stringify(rows)}`);
            return res.send(rows);
        }
        else {
            return res.send("No errors occurred, however no rows were found either.");
        }
    });
}

// This function is currently can't be implemented because the Join Table "Project_Users" is never inserted into.  But from what I can see with the SQL, it is going to select unique users and their timeIn and TimeOut using the desired projectID.
exports.GetUserTimesForProject = (req, res) => {
    console.log("ProjectControllers.js file/GetUserTimesForProject route called");

    let projectID = req.params["id"];
    console.log("projectID: " + projectID);

    let sql = `SELECT DISTINCT u.userID, u.firstName, u.lastName, t.timeIn, t.timeOut
        FROM Users as u
        INNER JOIN Project_Users as pu ON u.userID = pu.userID
        LEFT JOIN TimeCard as t ON u.userID = t.userID
        WHERE t.projectID = ${projectID}`;

    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ message: 'Something went wrong. Please try again later.' });
        }
        if (rows) {
            return res.send(rows);
        }
    });
}

exports.GetAllProjectsForCourse = (req, res) => { // grab all projects based on provided courseID
    console.log("ProjectControllers.js file/GetAllProjectsForCourse route called");

    let courseID = req.params["id"];
    console.log(`courseID: ${courseID}`);

    let sql = `SELECT projectName, projectID, description
        FROM Projects WHERE courseID = ?`;

    db.all(sql, [courseID], (err, rows) => {
        if (err) {
            return res.status(500).json({ message: 'Something went wrong. Please try again later.' });
        }
        if (rows) {
            return res.send(rows);
        }
    });
}

exports.GetUserProjectsForCourse = (req, res) => {
    console.log("ProjectControllers.js file/GetUserProjectsForCourse route called");

    let courseID = req.params["courseID"];
    let userID = req.params["userID"];

    let sql = `SELECT DISTINCT p.projectName, p.projectID, p.description
        FROM Projects p
        INNER JOIN Project_Users pu ON p.projectID = pu.projectID
        WHERE p.courseID = ${courseID} AND pu.userID = ${userID}`;

    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ message: 'Something went wrong. Please try again later.' });
        }
        if (rows) {
            return res.send(rows);
        }
    });
}

exports.GetNonUserProjectsForCourse = (req, res) => {
    console.log("ProjectControllers.js file/GetNonUserProjectsForCourse route called");

    courseID = req.params["courseID"];
    userID = req.params["userID"];

    let sql = `SELECT DISTINCT p.projectName, p.projectID, p.description
        FROM Projects p
        WHERE p.courseID = ${courseID} AND p.projectID not in (
            SELECT p.projectID
            FROM Projects p
            INNER JOIN Project_Users pu ON p.projectID = pu.projectID
            WHERE pu.userID = ${userID}
            )`;

    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ message: 'Something went wrong. Please try again later.' });
        }
        if (rows) {
            return res.send(rows);
        }
    });
}

exports.JoinGroup = async (req, res, next) => {
    console.log("UsersControllers.js file/JoinGroup route called");

    let data = [];
    data[0] = req.body["userID"];
    data[1] = req.body["projectID"];

    db.run(`INSERT INTO Project_Users(userID, projectID)
        VALUES(?, ?)`, data, function (err, value) {
        if (err) {
            console.log(err)
            return res.status(500).json({ message: 'Something went wrong. Please try again later.' });
        }
        else {
            return res.status(200).json({ message: 'User Project added.' });
        }
    });
}