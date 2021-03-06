const { Model } = require('sequelize');
const Sequelize = require('sequelize');

class Appointment extends Model {
    static init(sequelize) {
        super.init({
            date: Sequelize.STRING,
            canceled_at: Sequelize.STRING,
        }, {
            sequelize
        });

        return this;
    }
    static associate(models) {
        this.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
        this.belongsTo(models.User, { foreignKey: 'provider_id', as: 'provider' });
    }
}
module.exports = Appointment;