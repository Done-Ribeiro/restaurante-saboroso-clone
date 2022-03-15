// add um prototype ao obj do DOM do formulario, e add um recurso pra ele
HTMLFormElement.prototype.save = function () {
  let form = this;

  return new Promise((resolve, reject) => {
    form.addEventListener('submit', e => {
      e.preventDefault();

      let formData = new FormData(form);

      fetch(form.action, {
        method: form.method,
        body: formData
      })
        .then(response => response.json())
        .then(json => {
          if (json.error) {
            reject(json);
          } else {
            resolve(json);
          }

        }).catch(err => {
          reject(err);
        });
    });
  });
}