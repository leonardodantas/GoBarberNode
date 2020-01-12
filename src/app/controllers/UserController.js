const User = require('../models/User');
const yup = require('yup');

class UserController {

    async store(req, res) {

        const shema = yup.object().shape({
            name: yup.string().required(),
            email: yup.string().required(),
            password: yup.string().required().min(6)
        });

        if (!(await shema.isValid(req.body)))
            return res.status(401).json({ error: 'Validation fails' });

        const userExist = await User.findOne({ where: { email: req.body.email } });

        if (userExist) {
            return res.status(400).json({ error: "User already exists." });
        }

        const { id, name, email, provider } = await User.create(req.body);
        return res.json({
            id,
            name,
            email,
            provider
        });
    }

    async update(req, res) {
        const { email, oldPassword } = req.body;
        const user = await User.findByPk(req.userId);

        const shema = yup.object().shape({
            name: yup.string(),
            email: yup.string(),
            oldPassword: yup.string().min(6),
            password: yup.string().min(6).when('oldPassword', (oldPassword, field) => oldPassword ? field.required() : field),
            confirmPassword: yup.string().when('password', (password, field) => password ? field.required().oneOf([yup.ref('password')]) : field)
        });

        if (!(await shema.isValid(req.body)))
            return res.status(401).json({ error: 'Validation fails' });

        if (email != user.email) {
            const userExist = await User.findOne({ where: { email } });

            if (userExist) {
                return res.status(400).json({ error: "User already exists." });
            }
        }

        if (oldPassword && !(await user.checkPassword(oldPassword))) {
            return res.status(401).json({ error: "Password does match" });
        }

        const { id, name, provider } = await user.update(req.body);

        return res.json({
            id,
            name,
            email,
            provider
        });
    }
}

module.exports = new UserController();