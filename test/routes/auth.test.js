const request = require('supertest');
const app = require('../../src/app');

test('deve receber token ao logar', () => {
    return app.services.user.save(
        { name: 'Walter Mitty', mail: `${Date.now()}@mail.com`, passwd: '123456' })
        .then(() => request(app).post('/auth/signin')
            .send({ mail, passwd: '123456' }))
        .then((res) => {
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('token');
        })
})