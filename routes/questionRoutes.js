var express = require('express');
var router = express.Router();
var questionController = require('../controllers/questionController.js');

/*
 * GET
 */
router.get('/', questionController.list);

/*
 * GET
 */
router.get('/:id', questionController.show);

/*
 * POST
 */
router.post('/', questionController.create);

/*
 * PUT
 */
router.put('/:id', questionController.update);

/*
 * DELETE
 */
router.delete('/:id', questionController.remove);

module.exports = router;
