const request = require('supertest');
const app = require('../../src/app');
const jwt = require('jwt-simple');

const MAIN_ROUTE = '/v1/transactions';
let user;
let user2;
let accUser;
let accUser2;

beforeAll(async () => {
    await app.db('transactions').del();
    await app.db('accounts').del();
    await app.db('users').del();
    const users = await app.db('users').insert([
        { name: 'User #1', mail: 'user@mail.com', passwd: '$2a$10$wvOMVRIohB.7W9Ig.eNl7e9BA4H.tMlIrQLPqWmEaLPFJkJUUqC/e' },
        { name: 'User #2', mail: 'user2@mail.com', passwd: '$2a$10$wvOMVRIohB.7W9Ig.eNl7e9BA4H.tMlIrQLPqWmEaLPFJkJUUqC/e' }
    ], '*');
    [user, user2] = users;
    delete user.passwd;
    user.token = jwt.encode(user, 'Segredo');
    const accs = await app.db('accounts').insert([
        { name: 'Acc #1', user_id: user.id },
        { name: 'Acc #2', user_id: user2.id }
    ], '*');
    [accUser, accUser2] = accs;
})

test('deve listar apenas as transacoes do usuario', () => {
    return app.db('transactions').insert([
        { description: 'T1', date: new Date(), ammount: 100, type: 'I', acc_id: accUser.id },
        { description: 'T2', date: new Date(), ammount: 300, type: 'O', acc_id: accUser2.id }
    ]).then(() => request(app).get(MAIN_ROUTE)
        .set('authorization', `bearer ${user.token}`)
        .then((res) => {
            expect(res.status).toBe(200)
            expect(res.body).toHaveLength(1);
            expect(res.body[0].description).toBe('T1')
        }))
})

test('deve funcionar com snippets', () => {
    return request(app).get(MAIN_ROUTE)
        .set('authorization', `bearer ${user.token}`)
        .then((res) => {
            expect(res.status).toBe(200)
            expect(res.body[0].description).toBe('T1')
        })
})

test('deve inserir uma transação com sucesso', () => {
    return request(app).post(MAIN_ROUTE)
        .set('authorization', `bearer ${user.token}`)
        .send({ description: 'T1', date: new Date(), ammount: 100, type: 'I', acc_id: accUser.id })
        .then((res) => {
            expect(res.status).toBe(201)
            expect(res.body.ammount).toBe('100.00')
            expect(res.body.acc_id).toBe(accUser.id)
        })
})

test('transacoes de entrada deve ser positivas', () => {
    return request(app).post(MAIN_ROUTE)
        .set('authorization', `bearer ${user.token}`)
        .send({ description: 'T1', date: new Date(), ammount: -100, type: 'I', acc_id: accUser.id })
        .then((res) => {
            expect(res.status).toBe(201)
            expect(res.body.ammount).toBe('100.00')
            expect(res.body.acc_id).toBe(accUser.id)
        })
})

test('transacoes de saida deve ser negativas', () => {
    return request(app).post(MAIN_ROUTE)
        .set('authorization', `bearer ${user.token}`)
        .send({ description: 'T1', date: new Date(), ammount: 100, type: 'O', acc_id: accUser.id })
        .then((res) => {
            expect(res.status).toBe(201)
            expect(res.body.ammount).toBe('-100.00')
            expect(res.body.acc_id).toBe(accUser.id)
        })
})

describe('ao tentar inserir uma transacao invalida', () => {

    //const validTransaction = { description: 'T1', date: new Date(), ammount: 100, type: 'I', acc_id: accUser.id };
    let validTransaction;

    beforeAll(() => {
        validTransaction = { description: 'T1', date: new Date(), ammount: 100, type: 'I', acc_id: accUser.id };
    })

    const testTemplate = (newData, erroMessage) => {
        return request(app).post(MAIN_ROUTE)
            .set('authorization', `bearer ${user.token}`)
            .send({ ...validTransaction, ...newData })
            .then((res) => {
                expect(res.status).toBe(400);
                expect(res.body.error).toBe(erroMessage);
            })
    }

    test('nao deve inserir uma transacao sem descricao', () => testTemplate({ description: null }, 'Descricao e um atributo obrigatorio'))

    test('nao deve inserir uma transacao sem valor', () => testTemplate({ ammount: null }, 'Valor e um atributo obrigatorio'))

    test('nao deve inserir uma transacao sem valor', () => {
        return request(app).post(MAIN_ROUTE)
            .set('authorization', `bearer ${user.token}`)
            .send({ description: 'T1', date: new Date(), type: 'I', acc_id: accUser.id })
            .then((res) => {
                expect(res.status).toBe(400);
                expect(res.body.error).toBe('Valor e um atributo obrigatorio');
            })
    })

    test.skip('nao deve inserir uma transacao sem data', () => {

    })

    test.skip('nao deve inserir uma transacao sem conta', () => {

    })

    test.skip('nao deve inserir uma transacao sem tipo', () => {

    })

    test.skip('nao deve inserir uma transacao com tipo invalido', () => {

    })
})


test('deve retornar uma transacao por id', () => {
    return app.db('transactions').insert(
        { description: 'T ID', date: new Date(), ammount: 100, type: 'I', acc_id: accUser.id }, ['id'],
    ).then(trans => request(app).get(`${MAIN_ROUTE}/${trans[0].id}`)
        .set('authorization', `bearer ${user.token}`)
        .then((res) => {
            expect(res.status).toBe(200);
            expect(res.body.id).toBe(trans[0].id);
        })
    )
})

test('deve alterar uma transacao', () => {
    return app.db('transactions').insert(
        { description: 'to update', date: new Date(), ammount: 100, type: 'I', acc_id: accUser.id }, ['id'],
    ).then(trans => request(app).put(`${MAIN_ROUTE}/${trans[0].id}`)
        .set('authorization', `bearer ${user.token}`)
        .send({ description: 'updated' })
        .then((res) => {
            expect(res.status).toBe(200);
            expect(res.body.description).toBe('updated');
        })
    )
})

test('deve remover uma transação', () => {
    return app.db('transactions').insert(
        { description: 'to delete', date: new Date(), ammount: 100, type: 'I', acc_id: accUser.id }, ['id'],
    ).then(trans => request(app).delete(`${MAIN_ROUTE}/${trans[0].id}`)
        .set('authorization', `bearer ${user.token}`)
        .then((res) => {
            expect(res.status).toBe(204);
        })
    )
})

test('nao deve remover uma transação de outro usuario', () => {
    return app.db('transactions').insert(
        { description: 'to delete', date: new Date(), ammount: 100, type: 'I', acc_id: accUser2.id }, ['id'],
    ).then(trans => request(app).delete(`${MAIN_ROUTE}/${trans[0].id}`)
        .set('authorization', `bearer ${user.token}`)
        .then((res) => {
            expect(res.status).toBe(403);
            expect(res.body.error).toBe('este recurso nao pertence ao usuario')
        })
    )
})

test('nao deve remover conta com transacao', () => {
    return app.db('transactions').insert(
        { description: 'to delete', date: new Date(), ammount: 100, type: 'I', acc_id: accUser.id }, ['id'],
    ).then(() => request(app).delete(`/v1/accounts/${accUser.id}`)
        .set('authorization', `bearer ${user.token}`)
        .then((res) => {
            expect(res.status).toBe(400);
            expect(res.body.error).toBe('esta conta possui transacoes associadas');
        })
    )
})