let conn = require('./db');

class Pagination {
  constructor(
    query,// a query, que vai ser executada
    params = [],// por padrao, é um array vazio
    itensPerPage = 10// por padrao, é 10
  ) {
    this.query = query;
    this.params = params;
    this.itensPerPage = itensPerPage;
    this.currentPage = 1;// inicia na pagina 1, a nao ser quando chama o getPage, que ai vai fazer uma regra diferente
  }

  getPage(page) {
    //? criando uma variavel currentPage, para a pagina atual
    this.currentPage = page - 1;// começa na pagina 1, mas vamos mudar pra 0, diminuimos 1; pra ficar mais facil da gnt calcular

    /**
     * * pq o bd trabalha com indices tipo array
     * * ou seja, a pagina 2 por ex.: é currentePage 2; (2-1) = 1
     * * (LIMIT 1, 10) = da como resultado, exatamente a segunda pagina da consulta
     * * 1 param - de onde vai começar a query | 2 param - quantidade
     * ? ou seja, o primeiro parametro vai ser -> (currentPage * itensPerPage)
     */
    this.params.push(
      this.currentPage * this.itensPerPage,// inicio da query
      this.itensPerPage// quantidade
    );

    return new Promise((resolve, reject) => {
      /**
       * ! com o multipleStatements habilitado no arquivo de configuracao do db.js, agora podemos mandar multiplas query's para o bd
       * * apos adicionarmos os 2 selects no array,
       * * usamos um .join, para converter ele, em uma string somente
       */
      conn.query([this.query, 'SELECT FOUND_ROWS() AS FOUND_ROWS'].join(';'), this.params, (err, results) => {
        if (err) {
          reject(err);
        } else {
          this.data = results[0],// agora o results retorna o resultado de 2 consultas, por isso indice [0], pegando os dados do 1 select
            this.total = results[1][0].FOUND_ROWS,//total de linhas retornadas, está na 2 consulta, [1], só que so me interessa a primeira linha, por isso [1][0].FOUND_ROWS
            this.totalPages = Math.ceil(this.total / this.itensPerPage)// total de paginas retornadas | Math.ceil -> arredonda pra cima

          this.currentPage++;//! como tinhamos zerado o currentPage.. depois que termina, precisamos voltar ele para 1

          resolve(this.data);
        }
      });
    });
  }

  getTotal() {
    return this.total;
  }

  getCurrentPage() {
    return this.currentPage;
  }

  getTotalPages() {
    return this.totalPages;
  }

  getNavigation(params) {
    let limitPagesNav = 5;
    let links = [];
    // nr -> number rows, numero de paginas
    let nrstart = 0;
    let nrend = 0;

    if (this.getTotalPages() < limitPagesNav) {// esse if, valida o minimo de 'botoes' necessários as páginas, (ex.: total_de_paginas: 3, limite_total_paginas: 5), sera 3 'botoes'... [1][2][3]
      limitPagesNav = this.getTotalPages();
    }

    //* saber se estamos nas - primeiras paginas
    if ((this.getCurrentPage() - parseInt(limitPagesNav / 2)) < 1) {// se a pagina que estou, menos, a metade do limite_paginas (limite / 2)
      nrstart = 1;
      nrend = limitPagesNav;

    //* saber se estamos nas - ultimas paginas
    } else if ((this.getCurrentPage() + parseInt(limitPagesNav / 2)) > this.getTotalPages()) {
      nrstart = this.getTotalPages() - limitPagesNav;
      nrend = this.getTotalPages();

    //* estou no - meio das paginas 
    } else {
      nrstart = this.getCurrentPage() - parseInt(limitPagesNav / 2);
      nrend = this.getCurrentPage() + parseInt(limitPagesNav / 2);
    }

    for (let x = nrstart; x <= nrend; x++) {
      links.push({
        text: x,// valor do texto do botao (numero de pagina)
        href: `?page=${x}`,
        active: (x === this.getCurrentPage())// se for, a pagina atual, active = true
      });
    }

    return links;
  }

}

module.exports = Pagination;