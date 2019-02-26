
exports.seed = function (knex, Promise) {
  // Deletes ALL existing entries
  return knex('transactions').del()
    .then(() => knex('transfers').del())
    .then(() => knex('accounts').del())
    .then(() => knex('users').del())
    .then(() => knex('users').insert([
      { id: 10000, name: 'Users #1', mail: 'user1@gmail.com', passwd: '$2a$10$wvOMVRIohB.7W9Ig.eNl7e9BA4H.tMlIrQLPqWmEaLPFJkJUUqC/e' },
      { id: 10001, name: 'Users #2', mail: 'user2@gmail.com', passwd: '$2a$10$wvOMVRIohB.7W9Ig.eNl7e9BA4H.tMlIrQLPqWmEaLPFJkJUUqC/e' }
    ])).then(() => knex('accounts').insert([
      { id: 10000, name: 'Acc #1', user_id: 10000 },
      { id: 10001, name: 'Acc #1', user_id: 10000 },
      { id: 10002, name: 'Acc #1', user_id: 10001 },
      { id: 10003, name: 'Acc #1', user_id: 10001 }
    ]))
    .then(() => knex('transfers').insert([
      { id: 10000, description: 'transfer #1', user_id: 10000, acc_ori_id: 10000, acc_dest_id: 10001, ammount: 100, date: new Date() },
      { id: 10001, description: 'transfer #1', user_id: 10001, acc_ori_id: 10002, acc_dest_id: 10003, ammount: 100, date: new Date() },
    ]))
    .then(() => knex('transactions').insert([
      { description: 'transaction from AccO #1', date: new Date(), ammount: 100, type: 'I', acc_id: 10001, transfer_id: 10000 },
      { description: 'transaction to AccD #1', date: new Date(), ammount: -100, type: 'O', acc_id: 10000, transfer_id: 10000 },
      { description: 'transaction from AccO #1', date: new Date(), ammount: 100, type: 'I', acc_id: 10003, transfer_id: 10001 },
      { description: 'transaction to AccD #1', date: new Date(), ammount: -100, type: 'O', acc_id: 10002, transfer_id: 10001 },
    ]))
};
