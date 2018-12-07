const ValidationError = require('../errors/ValidationErros')

module.exports = (app) => {
    const findAll = (filter = {}) => {
        return app.db('users').where(filter).select();
    };

    const save = async (user) => {
        if (!user.name) throw new ValidationError('Nome é um atributo obrigatorio');
        if (!user.mail) throw new ValidationError('Email é um atributo obrigatorio');
        if (!user.passwd) throw new ValidationError('Senha é um atributo obrigatorio');

        const userDb = await findAll({ mail: user.mail });

        if (userDb && userDb.length > 0) throw new ValidationError('Ja existe usuario com esse email');

        return app.db('users').insert(user, '*')
    };

    return { findAll, save }
}