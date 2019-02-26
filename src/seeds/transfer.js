
exports.seed = function (knex, Promise) {
  // Deletes ALL existing entries
  return knex('transactions').del()
    .then(() => knex('transfers').del())
    .then(() => knex('accounts').del())
    .then(() => knex('users').del())
    .then(() => knex('users').insert([
      { id: 1, name: 'Users #1', mail: 'user1@gmail.com', passwd: '$2a$10$wvOMVRIohB.7W9Ig.eNl7e9BA4H.tMlIrQLPqWmEaLPFJkJUUqC/e' },
      { id: 2, name: 'Users #2', mail: 'user2@gmail.com', passwd: '$2a$10$wvOMVRIohB.7W9Ig.eNl7e9BA4H.tMlIrQLPqWmEaLPFJkJUUqC/e' }
    ]))

};
