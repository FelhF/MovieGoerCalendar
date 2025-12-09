const express = require('express');
const { Pool } = require('pg');
const router = express.Router();

const pool = new Pool({                                             //DB
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

router.get('/', async (req, res) => {                               //Get events from 3000/events
  try {
    const result = await pool.query('SELECT * FROM movies ORDER BY release LIMIT 4');
    res.json(result.rows);
  } catch (error) {
    console.error('Error querying database:', error);
    res.json({ error: 'Failed to fetch data' });
  }
});

router.post('/', async (req, res) => {                              //Add new event 
  const { name, release } = req.body;

  if (!name || !release) {
    return res.json({ error: 'Name and date are required' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO movies (name, release) VALUES ($1, $2) RETURNING *',
      [name, release]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error inserting event:', error);
    res.json({ error: 'Failed to add event' });
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM movies WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    res.json({ message: 'Movie deleted successfully', deleted: result.rows[0] });
  } catch (error) {
    console.error('Error deleting movie:', error);
    res.json({ error: 'Failed to delete movie' });
  }
});

module.exports = router;
