/**
 * ! REFACT - refatorando formulario, para multiplos envios
 * ? porque precisamos trocar a abordagem de promise para callback's ?
 * ! porque uma promise() nao da mais de uma resposta
 * ! mas precisamos saber por exemplo, se deu 2 erros diferentes no alterar senha
 * ! por isso, trataremos com CALLBACK, e nao mais com promise
 * ! porque com callback agora, poder fazer multiplos envios
 */
HTMLFormElement.prototype.save = function (config) {// add um prototype ao obj do DOM do formulario, e add um recurso pra ele
  let form = this;

  form.addEventListener('submit', e => {
    e.preventDefault();// prevenir padrao do evento

    let formData = new FormData(form);// carregar formulario

    fetch(form.action, {// fazer envio do formulario via fetch
      method: form.method,
      body: formData
    })
      .then(response => response.json())
      .then(json => {
        if (json.error) {
          if (typeof config.failure === 'function') config.failure(json.error);// precisamos validar, se isto é uma fn, pra poder ser executada
        } else {
          if (typeof config.success === 'function') config.success(json);// precisamos validar, se isto é uma fn, pra poder ser executada
        }

      }).catch(err => {
        if (typeof config.failure === 'function') config.failure(err);// msm coisa aqui, com a diferenca, que vou passar a variavel do erro
      });
  });
}