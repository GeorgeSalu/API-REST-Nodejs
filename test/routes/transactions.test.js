const request = require('supertest');
const app = require('../../src/app');

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
    const accs = await app.db('accounts').insert([
        { name: 'Acc #1', user_id: user.id },
        { name: 'Acc #2', user_id: user2.id }
    ], '*');
    [accUser, accUser2] = accs;
})

test('deve listar apenas as transacoes do usuario', () => {
    return app.db('transactions').insert([
        { description: 'T1', data: new Date(), ammount: 100, acc_id: accUser.id },
        { description: 'T2', data: new Date(), ammount: 300, acc_id: accUser2.id }
    ])
})