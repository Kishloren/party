// routes/api.js
const express = require('express');
const router = express.Router();
const { sqlSelect, sqlExec } = require(process.env.ENV === 'PROD' ? '/home/ubuntu/shared/common.js' : '../lib/db.js');

// GET /api/select?query=...
router.get('/select', async (req, res) => {
  try {
    const query = req.query.query;
    console.log(query);
    const results = await sqlSelect(query);
    res.json(results);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

// POST /api/exec
router.post('/exec', async (req, res) => {
  try {
    const query = req.body.query;
    console.log(query);
    await sqlExec(query);
    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

module.exports = router;
