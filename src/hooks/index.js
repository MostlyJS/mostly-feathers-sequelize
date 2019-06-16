const presentEntity = require('./present-entity')
const responder = require('./responder')
const isAction = require('./is-action')
const populate = require('./populate')
const setupOrder = require('./setup-order')

module.exports = {
  isAction,
  responder,
  populate,
  presentEntity,
  setupOrder
}