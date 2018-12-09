const request = require('supertest');
const app = require('../../src/app');

test('deve criar usurio via signup', () => {
    return request(app).post('/auth/signup')
        .send({ name: 'Walter', mail: `${Date.now()}@mail.com`, passwd: '123456' })
        .then((res) => {
            expect(res.status).toBe(201)
            expect(res.body.name).toBe('Walter')
            expect(res.body).toHaveProperty('mail')
            expect(res.body).not.toHaveProperty('passwd')
        })
})

test('deve receber token ao logar', () => {
    const mail = `${Date.now()}@mail.com`;
    return app.services.user
        .save({ name: 'Walter Mitty', mail: `${Date.now()}@mail.com`, passwd: '123456' })
        .then(() => request(app).post('/auth/signin')
            .send({ mail, passwd: '123456' }))
        .then((res) => {
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('token');
        })
})

test('nao deve autenticar usuario com senha errada', () => {
    const mail = `${Date.now()}@mail.com`;
    return app.services.user
        .save({ name: 'Walter Mitty', mail: `${Date.now()}@mail.com`, passwd: '123456' })
        .then(() => request(app).post('/auth/signin')
            .send({ mail, passwd: '654321' }))
        .then((res) => {
            expect(res.status).toBe(400);
            expect(res.body.error).toBe('Usuario ou senha errado');
        })
})

test('nao deve autenticar usuario usuario inexistente', () => {
    return request(app).post('/auth/signin')
        .send({ mail: 'naoExiste@gmail.com', passwd: '654321' })
        .then((res) => {
            expect(res.status).toBe(400);
            expect(res.body.error).toBe('Usuario ou senha errado');
        })
})

test('nao deve acessar uma senha protegida sem token', () => {
    return request(app).get('/users')
        .then((res) => {
            expect(res.status).toBe(401)
        })
})