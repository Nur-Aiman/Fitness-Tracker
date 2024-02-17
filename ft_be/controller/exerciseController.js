var express = require('express')
const connection = require('../config/database')
const { query, pool } = require('../config/database')
const moment = require('moment-timezone');

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const adjustedDate = new Date(date.getTime() + Math.abs(date.getTimezoneOffset()*60000));
  return adjustedDate.toISOString().split("T")[0];
};

module.exports = {

  viewExerciseList : async function viewExerciseList(req, res) {

    try {
        const { rows } = await pool.query('SELECT * FROM ExerciseList');
        res.json(rows);
      } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
      }

  },

  addExercise: async function(req, res) {
    const { name } = req.body; 
    try {
      const result = await pool.query('INSERT INTO ExerciseList (Name) VALUES ($1) RETURNING *', [name]);
      res.json(result.rows[0]); 
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  },

  updateExerciseName: async function(req, res) {
    const { id, newName } = req.body; 
    try {
      const result = await pool.query('UPDATE ExerciseList SET Name = $1 WHERE Id = $2 RETURNING *', [newName, id]);
      if (result.rows.length > 0) {
        res.json(result.rows[0]); 
      } else {
        res.status(404).send('Exercise not found');
      }
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  },

  viewExerciseLog: async function (req, res) {
    const { startDate, endDate } = req.query; // Get the dates from query parameters
    try {
        let queryText = `
            SELECT exerciseLog.id, 
                   TO_CHAR(exerciseLog.date :: DATE, 'yyyy-mm-dd') as date, 
                   exerciseLog.exercisecompleted, 
                   exerciseLog.exercisedetails, 
                   exerciseList.name AS exercisename 
            FROM ExerciseLog exerciseLog 
            INNER JOIN ExerciseList exerciseList ON exerciseLog.exercisecompleted = exerciseList.id
        `;

        let queryParams = [];

        if (startDate && endDate) {
            queryText += ` WHERE exerciseLog.date BETWEEN $1 AND $2`;
            queryParams.push(startDate, endDate);
        }

        queryText += ` ORDER BY exerciseLog.date DESC`;

        const { rows } = await pool.query(queryText, queryParams);
        res.json(rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
},


  addOrUpdateExerciseLog: async function (req, res) {
    const { exerciseId, exerciseDetail } = req.body;
    const today = moment().tz("Asia/Kuala_Lumpur").format('YYYY-MM-DD');

    try {
    
        const logRes = await pool.query('SELECT * FROM ExerciseLog WHERE Date = $1 AND ExerciseCompleted = $2', [today, exerciseId]);
        
        if (logRes.rows.length === 0) {
    
            const insertRes = await pool.query(
                'INSERT INTO ExerciseLog (Date, ExerciseCompleted, ExerciseDetails) VALUES ($1, $2, $3) RETURNING *',
                [today, exerciseId, exerciseDetail]
            );
            res.json(insertRes.rows[0]);
        } else {
           
            const updateRes = await pool.query(
                'UPDATE ExerciseLog SET ExerciseDetails = $3 WHERE Date = $1 AND ExerciseCompleted = $2 RETURNING *',
                [today, exerciseId, exerciseDetail]
            );
            res.json(updateRes.rows[0]);
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }

},

// Controller function for deleting an exercise
deleteExercise: async function(req, res) {
  const { id } = req.params; // Get the ID from the URL parameters
  try {
    await pool.query('DELETE FROM ExerciseList WHERE Id = $1', [id]);
    res.status(200).send('Exercise deleted successfully');
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
},



}