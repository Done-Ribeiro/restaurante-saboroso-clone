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
  }
};