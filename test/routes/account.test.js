const request = require('supertest');
const app = require('../../src/app');

const MAIN_ROUTE = '/accounts';
let user;

beforeAll(async () => {
    const res = await app.services.user.save({ name: 'User Account', mail: `${Date.now()}@gmail.com`, passwd: '123456' })
    user = { ...res[0] };
})

test('Deve inserir uma conta com sucesso', () => {
    return request(app).post(MAIN_ROUTE)
        .send({ name: 'Acc #1', user_id: user.id })
        .then((result) => {
            expect(result.status).toBe(201);
            expect(result.body.name).toBe('Acc #1')
        })
})

test('nao deve inserir uma conta sem nome', () => {
    return request(app).post(MAIN_ROUTE)
        .send({ user_id: user.id })
        .then((result) => {
            expect(result.status).toBe(400);
            expect(result.body.error).toBe('Nome é um atributo obrigatorio')
        })
})

test.skip('nao deve inserir uma conta de nome duplicado', () => {

})

test('deve listar todas as contas ', () => {
    return app.db('accounts')
        .insert({ name: 'Acc list', user_id: user.id })
        .then(() => request(app).get(MAIN_ROUTE))
        .then((res) => {
            expect(res.status).toBe(200);
            expect(res.body.length).toBeGreaterThan(0);
        })
})

test.skip('deve listar apenas as contas do usuario', () => {

})

test('deve retornar uma conta por id', () => {
    return app.db('accounts')
        .insert({ name: 'Acc By id', user_id: user.id }, ['id'])
        .then(acc => request(app).get(`${MAIN_ROUTE}/${acc[0].id}`))
        .then((res) => {
            expect(res.status).toBe(200);
            expect(res.body.name).toBe('Acc By id');
            expect(res.body.user_id).toBe(user.id)
        })
})

test.skip('nao deve retornar um conta de outro usuario', () => {

})

test('deve alterar uma conta', () => {
    return app.db('accounts')
        .insert({ name: 'Acc To Update', user_id: user.id }, ['id'])
        .then(acc => request(app).get(`${MAIN_ROUTE}/${acc[0].id}`)
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
        .then(acc => request(app).delete(`${MAIN_ROUTE}/${acc[0].id}`))
        .then((res) => {
            expect(res.status).toBe(204)
        })
})

test.skip('nao deve remover um conta de outro usuario', () => {

})