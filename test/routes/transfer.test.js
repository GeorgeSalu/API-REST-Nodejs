const request = require('supertest');
const app = require('../../src/app');
const jwt = require('jwt-simple');

const MAIN_ROUTE = '/v1/transfers';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEwMDAwIiwibmFtZSI6IlVzZXJzICMxIiwibWFpbCI6InVzZXIxQGdtYWlsLmNvbSJ9.mYe4HrY4RbmS0hPcUSUPzMxJ85dCZsw_n85MA8UChpo';


beforeAll(async () => {
    //await app.db.migrate.rollback();
    //await app.db.migrate.latest();
    await app.db.seed.run();
})

test('deve listar apenas as transferencias do usuario', () => {
    return request(app).get(MAIN_ROUTE)
        .set('authorization', `bearer ${TOKEN}`)
        .then((res) => {
            console.log(res.body)
            expect(res.status).toBe(200);
            expect(res.body).toHaveLength(1);
            expect(res.body[0].description).toBe('transfer #1');
        })
})

