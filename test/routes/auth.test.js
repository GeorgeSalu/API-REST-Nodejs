const request = require('supertest');
const app = require('../../src/app');

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