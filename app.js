const { app } = require('./app/express');
const db = require('./app/models');

const PORT = process.env.PORT || 3000;

// Sync the database and start the server
db.sequelize.authenticate()
  .then(() => {
    console.log('Database connected successfully');
    return db.sequelize.sync();
  })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Database connection failed:', err);
  });