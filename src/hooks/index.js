const presentEntity = require('./present-entity')
const responder = require('./responder')
const isAction = require('./is-action')
const populate = require('./populate')

module.exports = {
  isAction,
  responder,
  populate,
  presentEntity
}