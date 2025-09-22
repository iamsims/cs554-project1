const express = require('express');
const morgan = require('morgan');

const app = express();

// middleware for logging
app.use(morgan('combined'));

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.get('/convert', (req, res) => {
  const lbsParam = req.query.lbs;
  
  if (lbsParam === undefined) {
    return res.status(400).json({ 
      error: 'Query param lbs is required and must be a number' 
    });
  }
  
  const lbs = Number(lbsParam);
  
  if (Number.isNaN(lbs)) {
    return res.status(400).json({ 
      error: 'Query param lbs is required and must be a number' 
    });
  }
  
  if (!Number.isFinite(lbs) || lbs < 0) {
    return res.status(422).json({ 
      error: 'lbs must be a non-negative, finite number' 
    });
  }
  
  const kg = Math.round(lbs * 0.45359237 * 1000) / 1000;
  
  return res.json({
    lbs: lbs,
    kg: kg,
    formula: 'kg = lbs * 0.45359237'
  });
});

// 404 handler for unknown routes
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
