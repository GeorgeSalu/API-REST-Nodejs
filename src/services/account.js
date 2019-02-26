const ValidationError = require('../errors/ValidationErros')

module.exports = (app) => {

    const findAll = (userId) => {
        return app.db('accounts').where({ user_id: userId });
    }

    const find = (filter = {}) => {
        return app.db('accounts').where(filter).first();
    }

    const save = async (account) => {
        if (!account.name) throw new ValidationError('Nome é um atributo obrigatorio');

        const accBd = await find({ name: account.name, user_id: account.user_id })
        if (accBd) throw new ValidationError('ja existe uma conta com este nome')

        return app.db('accounts').insert(account, '*');
    };

    const update = (id, account) => {
        return app.db('accounts')
            .where({ id })
            .update(account, '*')
    }

    const remove = async (id) => {

        const transaction = await app.services.transaction.findOne({ acc_id: id });

        if (transaction) throw new ValidationError('esta conta possui transacoes associadas');

        return app.db('accounts')
            .where({ id })
            .del();
    }

    return { save, findAll, find, update, remove };
};
