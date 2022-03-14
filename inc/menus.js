let conn = require('./db');
let path = require('path');

module.exports = {
  getMenus() {
    return new Promise((resolve, reject) => {
      conn.query(`
        SELECT * FROM tb_menus ORDER BY title
        `, (err, results) => {
        if (err) {
          reject(err);
        }
        resolve(results);
      });
    });
  },

  save(fields, files) {
    return new Promise((resolve, reject) => {
      fields.photo = `images/${path.parse(files.photo.path).base}`;// retorna o nome original da imagem

      let query, queryPhoto = '', params = [
        fields.title,
        fields.description,
        fields.price
      ];

      if (files.photo.name) {
        queryPhoto = ', photo = ?';
        params.push(fields.photo);
      }

      // UPDATE
      if (parseInt(fields.id) > 0) {
        params.push(fields.id);

        query = `
          UPDATE tb_menus
          SET
            title = ?,
            description = ?,
            price = ?
            ${queryPhoto}
          WHERE id = ?
        `;

      } else {
        // INSERT
        if (!files.photo.name) {
          reject('Envie a foto do prato.')
        }

        query = `
          INSERT INTO tb_menus (title, description, price, photo)
          VALUES (?, ?, ?, ?)
        `;
      }

      // query generica (para insert e update)
      conn.query(query, params, (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      });
    });
  }
};