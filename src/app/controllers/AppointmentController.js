const { startOfHour, parseISO, isBefore, format, subHours } = require('date-fns');

const Appointment = require('../models/Appointment');
const yup = require('yup');
const User = require('../models/User');
const File = require('../models/File');
const Notification = require('../schemas/Notifications');

const Mail = require('../../lib/Mail');

class AppointmentController {

    async index(req, res) {

        const { page = 1 } = req.query;

        const appointments = await Appointment.findAll({
            where: {
                user_id: req.userId,
                canceled_at: null,
            },
            order: ['date'],
            attribute: ['id', 'date'],
            limit: 20,
            offset: (page - 1) * 20,
            include: [{
                model: User,
                as: 'provider',
                attributes: ['id', 'name'],
                include: [{
                    model: File,
                    as: 'avatar',
                    attributes: ['id', 'path', 'url']
                }]
            }]
        })
        return res.json(appointments);
    }

    async store(req, res) {

        const schema = yup.object().shape({
            date: yup.date().required(),
            provider_id: yup.number().required()
        });

        if (!(await schema.isValid(req.body)))
            return res.status(400).json({ error: "Validation Fails" });

        const { provider_id, date } = req.body;

        const checkIsProvider = await User.findOne({
            where: { id: provider_id, provider: true }
        });

        if (!checkIsProvider) {
            return res.status(401).json({ error: "You can only create appointments with providers" });
        }

        const hourStart = startOfHour(parseISO(date));

        if (isBefore(hourStart, new Date())) {
            return res.status(400).json({ error: "Past date or not permited" });
        }

        const checkAvalilability = await Appointment.findOne({
            where: {
                provider_id,
                canceled_at: null,
                date: hourStart
            }
        })

        if (checkAvalilability)
            return res.status(400).json({ error: "Appointment is not available" });

        const appointments = await Appointment.create({
            user_id: req.userId,
            provider_id,
            date
        });

        const user = await User.findByPk(req.userId);
        const formatDate = format(hourStart, "dd 'de' MMMM 'as' H':'mm'h' ")

        await Notification.create({
            content: `Novo Agendamento de ${user.name} para dia ${formatDate}`,
            user: provider_id
        })

        return res.json(appointments);

    }

    async delete(req, res) {
        const appointment = await Appointment.findByPk(req.params.id, {
            include: [{
                model: User,
                as: 'provider',
                attributes: ['name', 'email']
            }]
        });
        if (appointment.user_id != req.userId)
            return res.status(401).json({ error: "Not permissed" });

        const dateWithSub = subHours(appointment.date, 2);

        if (isBefore(dateWithSub, new Date()))
            return res.status(401).json({ error: "You can only cancel appointment 2 hous to advance" });

        appointment.canceled_at = new Date();
        await Mail.sendMail({
            to: `${appointment.provider.name} <${appointment.provider.email}>`,
            subject: 'Agendamento Cancelado',
            template: 'cancelation'
        });

        //await appointment.save();

        return res.json(appointment);
    }
}

module.exports = new AppointmentController();