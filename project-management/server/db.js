const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  password: "2006avi",
  host: "localhost",
  port: 5432,
  database: "project_management",
});

module.exports = pool;