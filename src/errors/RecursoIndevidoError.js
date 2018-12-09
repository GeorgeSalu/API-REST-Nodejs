module.exports = function RecursoIndevidoError(message = 'este recurso nao pertence ao usuario') {
    this.name = 'RecursoIndevidoError';
    this.message = message;
}