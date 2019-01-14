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
            console.log(res.body)
            expect(res.body[0].description).toBe('T1')
        }))
})

test('deve funcionar com snippets', () => {
    return request(app).get(MAIN_ROUTE)
        .set('authorization', `bearer ${user.token}`)
        .then((res) => {
            expect(res.status).toBe(200)
            console.log(res.body)
            expect(res.body[0].description).toBe('T1')
        })
})

test('deve inserir uma transação com sucesso', () => {
    return request(app).post(MAIN_ROUTE)
        .set('authorization', `bearer ${user.token}`)
        .send({ description: 'New T', date: Date(), ammount: 100, type: 'I', acc_id: accUser.id })
        .then((res) => {
            expect(res.status).toBe(201)
            expect(res.body.acc_id).toBe(accUser.id)
        })
})
