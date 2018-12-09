const request = require('supertest');
const app = require('../../src/app');
const jwt = require('jwt-simple');
const MAIN_ROUTE = '/v1/accounts';
let user;
let user2;

beforeEach(async () => {
    const res = await app.services.user.save({ name: 'User Account', mail: `${Date.now()}@gmail.com`, passwd: '123456' })
    user = { ...res[0] };
    user.token = jwt.encode(user, 'Segredo');

    const res2 = await app.services.user.save({ name: 'User Account #2', mail: `${Date.now()}@gmail.com`, passwd: '123456' })
    user2 = { ...res2[0] };
})

test('Deve inserir uma conta com sucesso', () => {
    return request(app).post(MAIN_ROUTE)
        .send({ name: 'Acc #1' })
        .set('authorization', `bearer ${user.token}`)
        .then((result) => {
            expect(result.status).toBe(201);
            expect(result.body.name).toBe('Acc #1')
        })
})

test('nao deve inserir uma conta sem nome', () => {
    return request(app).post(MAIN_ROUTE)
        .send({ user_id: user.id })
        .set('authorization', `bearer ${user.token}`)
        .then((result) => {
            expect(result.status).toBe(400);
            expect(result.body.error).toBe('Nome é um atributo obrigatorio')
        })
})

test('nao deve inserir uma conta de nome duplicado', () => {
    return app.db('accounts').insert({ name: 'Acc duplicada', user_id: user.id })
        .then(() => {
            request(app).post(MAIN_ROUTE)
                .set('authorization', `bearer ${user.token}`)
                .send({ name: 'Acc duplicada' })
                .then((res) => {
                    expect(res.status).toBe(400);
                    expect(res.body.error).toBe('ja existe uma conta com este nome')
                })
        })
})

test('deve listar apenas as contas do usuario', () => {
    return app.db('accounts').insert([
        { name: 'Acc User #1', user_id: user.id },
        { name: 'Acc User #2', user_id: user2.id }
    ]).then(() => request(app).get(MAIN_ROUTE)
        .set('authorization', `bearer ${user.token}`)
        .then((res) => {
            expect(res.status).toBe(200);
            expect(res.body.length).toBe(1);
            expect(res.body[0].name).toBe('Acc User #1');
        }));
})

test('deve retornar uma conta por id', () => {
    return app.db('accounts')
        .insert({ name: 'Acc By id', user_id: user.id }, ['id'])
        .then(acc => request(app).get(`${MAIN_ROUTE}/${acc[0].id}`).set('authorization', `bearer ${user.token}`))
        .then((res) => {
            expect(res.status).toBe(200);
            expect(res.body.name).toBe('Acc By id');
            expect(res.body.user_id).toBe(user.id)
        })
})

test('nao deve retornar um conta de outro usuario', () => {
    return app.db('accounts')
        .insert({ name: 'Acc User #2', user_id: user2.id }, ['id'])
        .then(acc => {
            request(app).get(`${MAIN_ROUTE}/${acc[0].id}`)
                .set('authorization', `bearer ${user.token}`)
                .then((res) => {
                    expect(res.status).toBe(403);
                    expect(res.body.error).toBe('este recurso nao pertence ao usuario');
                })
        })
})

test('deve alterar uma conta', () => {
    return app.db('accounts')
        .insert({ name: 'Acc To Update', user_id: user.id }, ['id'])
        .then(acc => request(app).get(`${MAIN_ROUTE}/${acc[0].id}`).set('authorization', `bearer ${user.token}`)
            .send({ name: 'Acc Update' }))
        .then((res) => {
            expect(res.status).toBe(200);
            expect(res.body.name).toBe('Acc To Update')
        })
})

test.skip('nao deve alterar um conta de outro usuario', () => {

})

test('deve remover uma conta', () => {
    return app.db('accounts')
        .insert({ name: 'Acc By id', user_id: user.id }, ['id'])
        .then(acc => request(app).delete(`${MAIN_ROUTE}/${acc[0].id}`).set('authorization', `bearer ${user.token}`))
        .then((res) => {
            expect(res.status).toBe(204)
        })
})

test.skip('nao deve remover um conta de outro usuario', () => {

})