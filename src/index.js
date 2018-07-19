const hooks = require('./hooks')
const helpers = require('./helpers')
const plugins = require('./plugins')
const service = require('./service')
const sequelize = require('./sequelize')

module.exports = Object.assign({}, service, sequelize, { hooks, plugins, service, helpers })
