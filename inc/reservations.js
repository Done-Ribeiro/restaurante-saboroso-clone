var conn = require("./db");
var Pagination = require('./../inc/Pagination');
var moment = require('moment');

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

  getReservations(req) {
    return new Promise((resolve, reject) => {

      let page = req.query.page;
      let dtstart = req.query.dtstart;
      let dtend = req.query.dtend;

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
          links: pag.getNavigation(req.query)// passando todas as variaveis que tem no query (page, dtstart, dtend), pro nosso getNavigation()
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
  },

  chart(req) {
    return new Promise((resolve, reject) => {
      conn.query(`
        SELECT
          CONCAT(YEAR(date), '-', MONTH(date)) AS date,
          COUNT(*) AS total,
          SUM(people) / COUNT(*) AS avg_people
        FROM tb_reservations
        WHERE
          date BETWEEN ? AND ?
        GROUP BY YEAR(date), MONTH(date)
        ORDER BY YEAR(date) DESC, MONTH(date) DESC;
      `, [
        req.query.start,
        req.query.end
      ], (err, results) => {
        if (err) {
          reject(err);
        } else {
          // preciso de um array só para os meses, e um só para os valores
          let months = [];
          let values = [];

          results.forEach(row => {
            months.push(moment(row.date).format('MMM YYYY'));// row.date, date, pq foi o alias dado na query do bds | usamos o moment.js pra formatar para exemplo.: Janeiro 2018
            values.push(row.total);// o mesmo aqui, esse total é o alias da query
          });

          // se der certo, resolvemos a promise, passando os dois arrays para o obj do resolve
          resolve({
            months,
            values
          });
        }
      });
    });
  },

  dashboard() {
    return new Promise((resolve, reject) => {
      conn.query(`
        SELECT
          (SELECT COUNT(*) FROM tb_contacts) AS nrcontacts,
          (SELECT COUNT(*) FROM tb_menus) AS nrmenus,
          (SELECT COUNT(*) FROM tb_reservations) AS nrreservations,
          (SELECT COUNT(*) FROM tb_users) AS nrusers;
      `, (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results[0]);
        }
      });
    });
  }

};