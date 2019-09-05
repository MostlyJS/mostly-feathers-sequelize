const { isArray, find, map } = require('lodash')
const sequelize = require('sequelize')
const Op = sequelize.Op

module.exports = function populate(service, field, options = {}) {
  const idField = options.idField || 'id'
  return async context => {

    async function populateWith (items) {
      const resource = context.app.service(service)
      const ids = map(items, field)
      const results = await resource.find({
        query: { [idField]: { [Op.in]: ids } },
        paginate: false
      })
      if (results) {
        return map(items, item => {
          const obj = find(results, { [idField]: item[field] })
          if (obj) {
            item[field] = obj
          }
          return item
        })
      } else {
        return items
      }
    }

    let result = context.result.data || context.result
    if (!result) return context;

    if (isArray(result)) {
      result = await populateWith(result)
    } else {
      result = (await populateWith([result]))[0]
    }
    if (context.result.data) {
      context.result.data = result;
    } else {
      context.result = result;
    }
    return context
  }
}