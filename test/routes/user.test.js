const request = require('supertest');
const app = require('../../src/app');
const jwt = require('jwt-simple');
const mail = `${Date.now()}@mail.com`

let user;

const MAIN_ROUTE = '/v1/users';

beforeAll(async () => {
    const res = await app.services.user.save({ name: 'User Account', mail: `${Date.now()}@gmail.com`, passwd: '123456' })
    user = { ...res[0] };
    user.token = jwt.encode(user, 'Segredo');
})

test('Deve listar todos os usuarios', () => {
    return request(app).get(MAIN_ROUTE)
        .set('authorization', `bearer ${user.token}`)
        .then((res) => {
            expect(res.status).toBe(200);
            expect(res.body.length).toBeGreaterThan(0);
        })
})

test('Deve inserir usuario com sucesso', () => {
    return request(app).post(MAIN_ROUTE)
        .send({ name: 'Walter Mitty', mail, passwd: '123456' })
        .set('authorization', `bearer ${user.token}`)
        .then((res) => {
            expect(res.status).toBe(201);
            expect(res.body.name).toBe('Walter Mitty')
            expect(res.body).not.toHaveProperty('passwd')
        })
})

test('deve armazenar uma senha criptografada', async () => {
    const res = await request(app).post(MAIN_ROUTE)
        .send({ name: 'Walter Mitty', mail: `${Date.now()}@mail.com`, passwd: '123456' })
        .set('authorization', `bearer ${user.token}`)
    expect(res.status).toBe(201);

    const { id } = res.body
    const userDb = await app.services.user.findOne({ id });

    expect(userDb.passwd).not.toBeUndefined();
    expect(userDb.passwd).not.toBe('123456')
})

test('Nao deve inserir usuario sem nome', () => {
    return request(app).post(MAIN_ROUTE)
        .send({ mail: '111@gmail.com', passwd: '123456' })
        .set('authorization', `bearer ${user.token}`)
        .then((res) => {
            expect(res.status).toBe(400);
            expect(res.body.error).toBe('Nome é um atributo obrigatorio')
        })
})

test('nao deve inserir usuario sem email', async () => {
    const result = await request(app).post(MAIN_ROUTE)
        .send({ name: 'Walter Mitty', passwd: '123456' })
        .set('authorization', `bearer ${user.token}`)

    expect(result.status).toBe(400)
    expect(result.body.error).toBe('Email é um atributo obrigatorio')
})

test('Nao deve inserir usuairio sem senha', (done) => {
    request(app).post(MAIN_ROUTE)
        .send({ name: 'Walter Mitty', mail: '123456@gmail.com' })
        .set('authorization', `bearer ${user.token}`)
        .then((res) => {
            expect(res.status).toBe(400);
            expect(res.body.error).toBe('Senha é um atributo obrigatorio');
            done();
        })
})

test('Nao deve inserir usuario com email existente', () => {
    return request(app).post(MAIN_ROUTE)
        .send({ name: 'Walter Mitty', mail, passwd: '123456' })
        .set('authorization', `bearer ${user.token}`)
        .then((res) => {
            expect(res.status).toBe(400);
            expect(res.body.error).toBe('Ja existe usuario com esse email')
        })
})