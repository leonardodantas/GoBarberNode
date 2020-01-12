const { Model } = require('sequelize');
const Sequelize = require('sequelize');

const brycpt = require('bcryptjs');

class User extends Model {
    static init(sequelize) {
        super.init({
            name: Sequelize.STRING,
            email: Sequelize.STRING,
            password: Sequelize.VIRTUAL,
            password_hash: Sequelize.STRING,
            provider: Sequelize.BOOLEAN
        }, {
            sequelize
        });

        this.addHook('beforeSave', async(user) => {
            if (user.password) {
                user.password_hash = await brycpt.hash(user.password, 8);
            }
        });

        return this;
    }

    static associate(models) {
        this.belongsTo(models.File, { foreignKey: 'avatar_id', as: 'avatar' });
    }

    checkPassword(password) {
        return brycpt.compare(password, this.password_hash);
    }

}
module.exports = User;