var conn = require("./db");
var Pagination = require('./../inc/Pagination');

module.exports = {
  render(req, res, error, success) {// recebendo o req, para pegar os dados preenchidos pelo usuario quando enviou o form | error -> mensagem de erro, vem uma string
    res.render('reservations', {
      title: 'Reservas - Restaurante Saboroso!',
      background: 'images/img_bg_2.jpg',
      h1: 'Reserve uma Mesa!',
      body: req.body,
      error,
      success
    });
  },

  save(fields) {
    return new Promise((resolve, reject) => {
      // correcao bug - agora ele so formata a data, se tiver uma '/' na string
      if (fields.date.indexOf('/') > -1) {
        let date = fields.date.split('/');
        fields.date = `${date[2]}-${date[1]}-${date[0]}`// "2022-01-01" -> padrao do banco de dados
      }

      let query, params = [
        fields.name,
        fields.email,
        fields.people,
        fields.date,
        fields.time
      ];

      if (parseInt(fields.id) > 0) {
        // UPDATE
        query = `
          UPDATE tb_reservations
          SET
            name = ?,
            email = ?,
            people = ?,
            date = ?,
            time = ?
          WHERE id = ?
        `;
        params.push(fields.id);

      } else {
        // INSERT
        query = `
          INSERT INTO tb_reservations (name, email, people, date, time)
          VALUES (?, ?, ?, ?, ?)
        `;
      }

      // query generica
      conn.query(query, params, (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      });
    });
  },

  getReservations(page) {
    if (!page) page = 1;

    let pag = new Pagination(
      `
        SELECT SQL_CALC_FOUND_ROWS * FROM tb_reservations ORDER BY name LIMIT ?, ?
      `
    );

    return pag.getPage(page);// aqui passo o numero da pagina que quero buscar
  },

  delete(id) {
    return new Promise((resolve, reject) => {
      conn.query(`
        DELETE FROM tb_reservations
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