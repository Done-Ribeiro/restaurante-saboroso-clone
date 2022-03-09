var conn = require("./db");

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
      let date = fields.date.split('/');
      fields.date = `${date[2]}-${date[1]}-${date[0]}`// "2022-01-01" -> padrao do banco de dados

      conn.query(`
        INSERT INTO tb_reservations (name, email, people, date, time)
        VALUES (?, ?, ?, ?, ?)
      `, [
        fields.name,
        fields.email,
        fields.people,
        fields.date,
        fields.time
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