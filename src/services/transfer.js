const ValidationError = require('../errors/ValidationErros');

module.exports = (app) => {
    const find = (filter = {}) => {
        return app.db('transfers')
            .where(filter)
            .select();
    };

    const findOne = (filter = {}) => {
        return app.db('transfers')
            .where(filter)
            .first();
    };

    const save = async (transfer) => {

        if (!transfer.description) throw new ValidationError('descricao é um atributo obrigatorio');

        const result = await app.db('transfers').insert(transfer, '*');
        const transferId = result[0].id;

        const transactions = [
            { description: `transfer to acc ${transfer.acc_dest_id}`, date: transfer.date, ammount: transfer.ammount * -1, type: 'O', acc_id: transfer.acc_ori_id, transfer_id: transferId },
            { description: `transfer from acc ${transfer.acc_dest_id}`, date: transfer.date, ammount: transfer.ammount * -1, type: 'O', acc_id: transfer.acc_ori_id, transfer_id: transferId }
        ]

        await app.db('transactions').insert(transactions);
        return result;
    }

    return { find, save, findOne };
}