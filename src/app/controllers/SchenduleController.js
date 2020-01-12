const Appointment = require('../models/Appointment');
const User = require('../models/User');

class SchenduleController {

    async index(req, res) {
        const checkUserProvider = await User.findOne({
            where: { id: req.userId, provider: true }
        });

        if (!checkUserProvider)
            return res.status(401).json({ error: "User is not provider" });

        const { date } = req.query;

        const appointments = await Appointment.findAll({
            where: { provider_id: req.userId, date: date }
        });

        if (!appointments)
            return res.status(400).json({ error: "Not Appointments" });

        return res.json(appointments);
    }

}

module.exports = new SchenduleController();