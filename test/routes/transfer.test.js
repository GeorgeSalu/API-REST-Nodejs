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