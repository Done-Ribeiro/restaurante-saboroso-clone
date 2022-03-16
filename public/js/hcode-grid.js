class HcodeGrid {
  constructor(configs) {

    /**
     * ! o assign nao é recursivo, ou seja, ele nao sobrescreve objs que tem dentro dele
     * * por isso precisamos sobreescrever o listener do config 
     */
    configs.listeners = Object.assign({
      afterUpdateClick: (e) => {
        $('#modal-update').modal('show');
      },
      afterDeleteClick: (e) => {
        window.location.reload();
      },
      afterFormCreate: (e) => {
        window.location.reload();
      },
      afterFormUpdate: (e) => {
        window.location.reload();
      },
      afterFormCreateError: (e) => {
        alert('Não foi possivel enviar o formulário.');
      },
      afterFormUpdateError: (e) => {
        alert('Não foi possivel enviar o formulário.');
      }
    }, configs.listeners);

    // definindo o que ja vem por padrao no config, sobrescrevemos o que for de novo no Object.assign, e o resultado da mesclagem, colocamos no options
    this.options = Object.assign({
      formCreate: '#modal-create form',
      formUpdate: '#modal-update form',
      btnUpdate: 'btn-update',
      btnDelete: 'btn-delete',
      onUpdateLoad: (form, name, data) => {
        let input = form.querySelector('[name=' + name + ']');
        if (input) input.value = data[name];
      }
    }, configs);

    this.rows = [...document.querySelectorAll('table tbody tr')];

    this.initForms();
    this.initButtons();
  }

  initForms() {
    // CREATE
    this.formCreate = document.querySelector(this.options.formCreate);// this -> dando acesso a toda a classe, ao formCreate
    this.formCreate.save({
      success: () => {
        this.fireEvent('afterFormCreate');
      },
      failure: () => {
        this.fireEvent('afterFormCreateError');
      }
    });

    // UPDATE
    //* this -> é necessário dar acesso a classe, pois o initBtn do uptade precisa referenciar ela para funcionar
    this.formUpdate = document.querySelector(this.options.formUpdate);
    this.formUpdate.save({
      success: () => {
        this.fireEvent('afterFormCreateError');
      },
      failure: () => {
        this.fireEvent('afterFormUpdateError');
      }
    });
  }

  fireEvent(name, args) {
    // se for uma funcao que foi passada, executa a fn
    if (typeof this.options.listeners[name] === 'function') this.options.listeners[name].apply(this, args);
  }

  getTrData(e) {
    let tr = e.path.find(el => {
      return (el.tagName.toUpperCase() === 'TR');
    });

    return JSON.parse(tr.dataset.row);
  }

  btnUpdateClick(e) {
    // this.fireEvent('beforeUpdateClick', [e]);

    let data = this.getTrData(e);

    for (let name in data) {
      this.options.onUpdateLoad(this.formUpdate, name, data);
    }

    this.fireEvent('afterUpdateClick', [e]);
  }

  btnDeleteClick(e) {
    this.fireEvent('beforeDeleteClick');

    let data = this.getTrData(e);

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
          this.fireEvent('afterDeleteClick');
        });
    }
  }

  initButtons() {
    this.rows.forEach(row => {
      [...row.querySelectorAll('.btn')].forEach(btn => {
        btn.addEventListener('click', e => {
          // UPDATE
          if (e.target.classList.contains(this.options.btnUpdate)) {
            this.btnUpdateClick(e);

            // DELETE
          } else if (e.target.classList.contains(this.options.btnDelete)) {
            this.btnDeleteClick(e);

          } else {
            this.fireEvent('buttonClick', [e.target, this.getTrData(e), e]);
          }
        });
      });
    });
  }

}
