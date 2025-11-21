module.exports = {
    up: async (queryInterface, Sequelize) => {
        const transaction = await queryInterface.sequelize.transaction();
        return transaction; //table Reaction doesn't exist yet
        return Promise.all([
            transaction,
            queryInterface.changeColumn('Reaction ', 'reactionId', {
                type: Sequelize.TEXT
            }, {
                transaction,
            }),
            queryInterface.changeColumn('Reaction ', 'name', {
                type: Sequelize.TEXT
            }, {
                transaction,
            })
        ])
    },

    down: async (queryInterface, Sequelize) => {
        const transaction = await queryInterface.sequelize.transaction();
        return transaction; //table Reaction doesn't exist yet
        return Promise.all([
            queryInterface.changeColumn('Reaction ', 'reactionId', {
                type: Sequelize.STRING
            }, {
                transaction,
            }),
            queryInterface.changeColumn('Reaction ', 'name', {
                type: Sequelize.STRING
            }, {
                transaction,
            })
        ])
    }
};