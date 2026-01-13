const { Sequelize } = require('sequelize')

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  protocol: 'postgres',
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
})

<<<<<<< HEAD
module.exports = sequelize;
=======
module.exports = sequelize
>>>>>>> 6a7902716320cae307937357f20246743af2201f
