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

  getReservations(page, dtstart, dtend) {
    return new Promise((resolve, reject) => {

      if (!page) page = 1;
      let params = [];

      if (dtstart && dtend) params.push(dtstart, dtend);// verifico se foi passado as datas como parametro, e se foi.. faço o push no params

      let pag = new Pagination(
        `
        SELECT SQL_CALC_FOUND_ROWS *
        FROM tb_reservations
        ${(dtstart && dtend) ? 'WHERE date BETWEEN ? AND ?' : ''}
        ORDER BY name LIMIT ?, ?
      `,
        params
      );

      pag.getPage(page).then(data => {
        resolve({
          data,
          links: pag.getNavigation()
        })
      });
    });
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