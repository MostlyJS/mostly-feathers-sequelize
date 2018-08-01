const assert = require('assert')
const makeDebug = require('debug')
const { Service: BaseService } = require('./base')

const debug = makeDebug('mostly:feathers-sequelize:service:index.js')

class Service extends BaseService {
  constructor(options) {
    super(options)
  }

  setup (app) {
    this.app = app
  }

  async findOne (condition) {
    const query = { where: condition, $limit: 1 }
    const result = (await this.find(query)).data
    return result && result.length ? result[0] : undefined
  }

  async findAll () {
    return this.find({ paginate: false })
  }
  
  static create (options) {
    debug('create service: ', options)
    return new Service(options)
  }
}

module.exports = Service.create
module.exports.Service = Service