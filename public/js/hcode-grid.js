class HcodeGrid {
  constructor(configs) {

    /**
     * ! o assign nao é recursivo, ou seja, ele nao sobrescreve objs que tem dentro dele
     * * por isso precisamos sobreescrever o listener do config 
     */
    configs.listeners = Object.assign({
      afterUpdateClick: (e) => {
        $('#modal-update').modal('show');
      }
    }, configs.listeners);

    // definindo o que ja vem por padrao no config, sobrescrevemos o que for de novo no Object.assign, e o resultado da mesclagem, colocamos no options
    this.options = Object.assign({
      formCreate: '#modal-create form',
      formUpdate: '#modal-update form',
      btnUpdate: '.btn-update',
      btnDelete: '.btn-delete'
    }, configs);

    this.initForms();
    this.initButtons();
  }

  initForms() {
    // CREATE
    this.formCreate = document.querySelector(this.options.formCreate);// this -> dando acesso a toda a classe, ao formCreate
    this.formCreate.save().then(json => {// aqui esperamos o json da promise
      window.location.reload();// no sucesso, faço o reload da pagina
    }).catch(err => {
      console.log(err);
    });

    // UPDATE
    //* this -> é necessário dar acesso a classe, pois o initBtn do uptade precisa referenciar ela para funcionar
    this.formUpdate = document.querySelector(this.options.formUpdate);
    this.formUpdate.save().then(json => {// aqui esperamos o json da promise
      window.location.reload();// no sucesso, faço o reload da pagina
    }).catch(err => {
      console.log(err);
    });
  }

  fireEvent(name, args) {
    // se for uma funcao que foi passada, executa a fn
    if (typeof this.options.listeners[name] === 'function') this.options.listeners[name].apply(this, args);
  }

  initButtons() {
    // UPDATE
    [...document.querySelectorAll(this.options.btnUpdate)].forEach(btn => {
      btn.addEventListener('click', e => {
        let tr = e.path.find(el => {
          return (el.tagName.toUpperCase() === 'TR');
        });

        let data = JSON.parse(tr.dataset.row);

        for (let name in data) {
          let input = this.formUpdate.querySelector(`[name=${name}]`);

          switch (name) {
            case 'date':
              if (input) input.value = moment(data[name]).format('YYYY-MM-DD');// formatando data com moment, para o input carregar corretamente
              break;
            default:
              if (input) input.value = data[name];
              break;
          }
        }

        this.fireEvent('afterUpdateClick', [e]);

      });
    });

    // DELETE
    [...document.querySelectorAll(this.options.btnDelete)].forEach(btn => {
      btn.addEventListener('click', e => {

        let tr = e.path.find(el => {
          return (el.tagName.toUpperCase() === 'TR');
        });
        let data = JSON.parse(tr.dataset.row);

        /**
         * ! para fazermos uma template string passada por parametro (como string), voltar a ser uma template string, aqui precisamos fazer um eval, da nossa string
         * * mas para a template string funcionar, precisamos agora acrescentar as crases '`'
         */
        if (confirm(eval('`' + this.options.deleteMsg + '`'))) {// agora a minha string, esta dentro de um template string, e vou fazer um eval (pegar o valor dela)
          fetch(eval('`' + this.options.deleteUrl + '`'), {
            method: 'DELETE'
          })
            .then(response => response.json())
            .then(json => {
              window.location.reload();
            });
        }

      });
    });
  }

}
