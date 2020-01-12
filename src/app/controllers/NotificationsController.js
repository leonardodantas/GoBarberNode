const Notifications = require('../schemas/Notifications');
const User = require('../models/User');

class NotificationController {
    async index(req, res) {
        const checkIsProvider = await User.findOne({
            where: { id: req.userId, provider: true }
        })
        if (!checkIsProvider)
            return res.status(401).json({ error: "User is not provider" });

        const notifications = await Notifications.find({
            user: req.userId
        }).sort({ createdAt: 'desc' }).limit(20)

        if (!notifications)
            return res.status(400).json({ error: "Notifications not found" });

        return res.json(notifications);
    }

    async update(req, res) {
        const notification = await Notifications.findByIdAndUpdate(
            req.params.id, { read: true }, { new: true }
        );

        return res.json(notification)
    }
}

module.exports = new NotificationController();