const conn = require("./db");

module.exports = {
  render(req, res, error) {
    res.render('admin/login', {
      body: req.body,// para mandar talvez, o email, pro usuario, pra ficar preenchido no html
      error// pra mostrar o erro para o usuario
    });
  },

  login(email, password) {
    return new Promise((resolve, reject) => {
      conn.query(`
        SELECT * FROM tb_users WHERE email = ?
      `, [
        email
      ], (err, results) => {
        if (err) {
          reject(err);
        } else {
          //! validar password

          // senha em branco
          if (!results.length > 0) {
            reject("Usuário ou senha incorretos.");
          } else {
            let row = results[0];// pq o results pode retornar um array, e so nos interessamos na primeira linha

            // senhas incompativeis
            if (row.password !== password) {
              reject("Usuário ou senha incorretos.");
            } else {//* senha correta
              resolve(row);// row -> dados, do usuario autenticado, encontrado
            }
          }
        }
      });
    });
  },

  getUsers() {
    return new Promise((resolve, reject) => {
      conn.query(`
        SELECT * FROM tb_users ORDER BY name
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

      //? regra de negocio - a senha só sera criada no insert
      let query, params = [
        fields.name,
        fields.email
      ];

      // UPDATE
      if (parseInt(fields.id) > 0) {
        params.push(fields.id);

        query = `
          UPDATE tb_users
          SET
            name = ?,
            email = ?
          WHERE id = ?
        `;

      } else {
        // INSERT
        query = `
          INSERT INTO tb_users (name, email, password)
          VALUES (?, ?, ?)
        `;
        params.push(fields.password);//! aqui para atender a regra de nogocio, adicionamos a senha, aos params, que ate entao nao tinha
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
  },

  delete(id) {
    return new Promise((resolve, reject) => {
      conn.query(`
        DELETE FROM tb_users
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