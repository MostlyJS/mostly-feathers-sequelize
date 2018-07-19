const assert = require('assert')
const makeDebug = require('debug')
const Sequelize = require('sequelize')

const debug = makeDebug('mostly:features-sequelize:sequelize.js')

module.exports = class {
  static connecDB (options) {
    return function (app) {
      const sequelize = new Sequelize(options)
      sequelize
        .authenticate()
        .then(() => {
          debug('Connection has been established successfully.')
        })
        .catch(err => {
          console.error('Unable to connect to the database:', err);
        })
      app.set('sequelize', sequelize)
    }
  }

  static getModel (app, name, model) {
    const sequelize = app.get('sequelize')
    assert(sequelize, 'sequelize client not set by app')
    if (sequelize.models[name]) {
      return sequelize.models[name]
    } else {
      assert(model && typeof model === 'function', 'Model function not privided.');
      return model(app, name)
    }
  }

  static createModel (app, name, options) {
    const sequelize = app.get('sequelize')
    assert(sequelize, 'sequelize client not set by app')
    return sequelize.define(name, {}, options)
  }

  static createService (app, Service, Model, options) {
    Model = options.Model || Model;
    if (typeof Model === 'function') {
      assert(options.ModelName, 'createService but options.ModelName not provided');
      options.Model = Model(app, options.ModelName);
    } else {
      options.Model = Model;
    }
    const service = new Service(options);
    return service;
  }
}