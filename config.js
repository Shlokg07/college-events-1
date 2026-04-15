// Configuration file
module.exports = {
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/college_events',
  JWT_SECRET: process.env.JWT_SECRET || 'your_jwt_secret_key_change_in_production',
  PORT: process.env.PORT || 3000
};
