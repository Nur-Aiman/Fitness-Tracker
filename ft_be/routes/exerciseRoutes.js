var express = require('express');
const { viewExerciseList, addExercise, updateExerciseName, viewExerciseLog, addOrUpdateExerciseLog, deleteExercise} = require('../controller/exerciseController');
var router = express.Router();


/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/viewExercise', viewExerciseList)
router.post('/addExercise', addExercise);
router.post('/updateExerciseName', updateExerciseName);
router.get('/viewExerciseLog', viewExerciseLog);
router.post('/addOrUpdateExerciseLog', addOrUpdateExerciseLog);
router.delete('/deleteExercise/:id', deleteExercise);



module.exports = router;
