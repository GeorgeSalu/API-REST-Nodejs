const jwt = require('jwt-simple');
const bcrypt = require('bcrypt-nodejs');
const secret = 'Segredo';

const ValidationError = require('../errors/ValidationErros')

module.exports = (app) => {
    const signin = (req, res, next) => {
        app.services.user.findOne({ mail: req.body.mail })
            .then((user) => {
                if (!user) throw new ValidationError('Usuario ou senha errado')
                if (bcrypt.compareSync(req.body.passwd, user.passwd)) {
                    const payload = {
                        id: user.id,
                        name: user.name,
                        mail: user.mail,
                    }
                    const token = jwt.encode(payload, secret);
                    res.status(200).json({ token })
                } else {
                    throw new ValidationError('Usuario ou senha errado')
                }
            }).catch(err => next(err));
    };

    return { signin }
}