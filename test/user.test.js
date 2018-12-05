const request = require('supertest');
const app = require('../src/app');

test('Deve listar todos os usuarios', () => {
    return request(app).get('/users')
        .then((res) => {
            expect(res.status).toBe(200);
            expect(res.body.length).toBeGreaterThan(0);
        })
})

test('Deve inserir usuario com sucesso', () => {
    const mail = `${Date.now()}@mail.com`
    return request(app).post('/users')
        .send({ name: 'Walter Mitty', mail, passwd: '123456' })
        .then((res) => {
            expect(res.status).toBe(201);
            expect(res.body.name).toBe('Walter Mitty')
        })
})

test('Nao deve inserir usuario sem nome', () => {
    return request(app).post('/users')
        .send({ mail: '111@gmail.com', passwd: '123456' })
        .then((res) => {
            expect(res.status).toBe(400);
            expect(res.body.error).toBe('Nome é um atributo obrigatorio')
        })
})

test('nao deve inserir usuario sem email', async () => {
    const result = await request(app).post('/users')
        .send({ name: 'Walter Mitty', passwd: '123456' })


    expect(result.status).toBe(400)
    expect(result.body.error).toBe('Email é um atributo obrigatorio')
})

test('Nao deve inserir usuairio sem senha', (done) => {
    request(app).post('/users')
        .send({ name: 'Walter Mitty', mail: '123456@gmail.com' })
        .then((res) => {
            expect(res.status).toBe(400);
            expect(res.body.error).toBe('Senha é um atributo obrigatorio');
            done();
        })
})