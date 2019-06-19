const { isArray, find, map } = require('lodash')
const sequelize = require('sequelize')
const Op = sequelize.Op

module.exports = function populate(service, field) {
  return async context => {

    async function populateWith (items) {
      const resource = context.app.service(service)
      const ids = map(items, field)
      const results = await resource.find({
        query: { id: { [Op.in]: ids } },
        paginate: false
      })
      if (results) {
        return map(items, item => {
          const obj = find(results, { id: item[field] })
          if (obj) {
            item[field] = obj
          }
          return item
        })
      } else {
        return items
      }
    }

    if (isArray(context.result.data)) {
      context.result.data = await populateWith(context.result.data)
    } else {
      context.result.data = (await populateWith([context.result.data]))[0]
    }
    return context
  }
}