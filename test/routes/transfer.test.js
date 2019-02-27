const request = require('supertest');
const app = require('../../src/app');
const jwt = require('jwt-simple');

const MAIN_ROUTE = '/v1/transfers';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEwMDAwIiwibmFtZSI6IlVzZXJzICMxIiwibWFpbCI6InVzZXIxQGdtYWlsLmNvbSJ9.mYe4HrY4RbmS0hPcUSUPzMxJ85dCZsw_n85MA8UChpo';


beforeAll(async () => {
    //await app.db.migrate.rollback();
    //await app.db.migrate.latest();
    await app.db.seed.run();
})

test('deve listar apenas as transferencias do usuario', () => {
    return request(app).get(MAIN_ROUTE)
        .set('authorization', `bearer ${TOKEN}`)
        .then((res) => {
            expect(res.status).toBe(200);
            expect(res.body).toHaveLength(1);
            expect(res.body[0].description).toBe('transfer #1');
        })
})

test('deve inserir uma transferencia com sucesso', () => {
    return request(app).post(MAIN_ROUTE)
        .set('authorization', `bearer ${TOKEN}`)
        .send({ description: 'regular transfer', user_id: 10000, acc_ori_id: 10000, acc_dest_id: 10001, ammount: 100, date: new Date() })
        .then(async (res) => {
            expect(res.status).toBe(201);
            expect(res.body.description).toBe('regular transfer');

            const transactions = await app.db('transactions').where({ transfer_id: res.body.id });

            expect(transactions).toHaveLength(2);
            expect(transactions[0].description).toBe('transfer to acc 10001');
            expect(transactions[0].ammount).toBe('-100.00');
            expect(transactions[1].ammount).toBe('-100.00');
            expect(transactions[0].acc_id).toBe(10000);
            expect(transactions[1].acc_id).toBe(10000);
        })
})

describe('ao salvar um transaferencia valida...', () => {
    let transferId;
    let income;
    let outcome;
    test('deve restornar o status 201 e os dados da transaferencia', () => {
        return request(app).post(MAIN_ROUTE)
            .set('authorization', `bearer ${TOKEN}`)
            .send({ description: 'regular transfer', user_id: 10000, acc_ori_id: 10000, acc_dest_id: 10001, ammount: 100, date: new Date() })
            .then(async (res) => {
                expect(res.status).toBe(201);
                expect(res.body.description).toBe('regular transfer');

                transferId = res.body.id;
            });
    })

    test('as transacoes equivalentes devem ter sito geradas', async () => {
        const transactions = await app.db('transactions').where({ transfer_id: transferId }).orderBy('ammount');

        expect(transactions).toHaveLength(2);

        [outcome, income] = transactions;
    })

    test('a transacao de saida deve ser negativa', () => {
        expect(outcome.description).toBe('transfer to acc 10001');
        expect(outcome.ammount).toBe('-100.00');
        expect(outcome.acc_id).toBe(10000);
        expect(outcome.type).toBe('O');
    })

})

describe('ao tentar salvar uma transferencia invalida...', () => {

    const validTransfer = { description: 'regular transfer', user_id: 10000, acc_ori_id: 10000, acc_dest_id: 10001, ammount: 100, date: new Date() };

    const template = (newData, erroMessage) => {
        return request(app).post(MAIN_ROUTE)
            .set('authorization', `bearer ${TOKEN}`)
            .send({ ...validTransfer, ...newData })
            .then((res) => {
                expect(res.status).toBe(400);
                expect(res.body.error).toBe(erroMessage);
            })
    }

    test('nao deve inserir sem descricao', () => {
        template({ description: null }, 'descricao é um atributo obrigatorio')
    })

    test('nao deve inserir sem valor', () => {
        template({ ammount: null }, 'valor é um atributo obrigatorio')
    })

    test('nao deve inserir sem data', () => {
        template({ date: null }, 'Data é um atributo obrigatorio')
    })

    test('nao deve inserir sem conta de origem', () => {
        template({ acc_ori_id: null }, 'conta de origem é um atributo obrigatorio')
    })

    test('nao deve inserir sem conta de destino', () => {
        template({ acc_dest_id: null }, 'conta de destino é um atributo obrigatorio')
    })

    test('nao deve inserir sem as contas de origem forem as mesmas', () => {
        template({ acc_dest_id: 10000 }, 'nao é possivel transaferir de uma conta para ela mesma')
    })

    test('nao deve inserir sem as contas pertencerem a outro usuario', () => {
        template({ acc_ori_id: 10002 }, 'conta de numero 10002 nao pertence ao usuario')
    })
});

