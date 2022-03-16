const conn = require("./db");

module.exports = {
  getEmails() {
    return new Promise((resolve, reject) => {
      conn.query(`
        SELECT * FROM tb_emails ORDER BY register DESC
        `, (err, results) => {
        if (err) {
          reject(err);
        }
        resolve(results);
      });
    });
  },

  delete(id) {
    return new Promise((resolve, reject) => {
      conn.query(`
        DELETE FROM tb_emails
        WHERE id = ?
        `, [
        id
      ], (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      });
    });
  }

};