module.exports = function populate(service, field) {
  return async context => {

    async function simpleJoin (item) {
      const resource = context.app.service(service)
      if (resource && item[field]) {
        const result = await resource.first({ query: { id: item[field] } })
        if (result) {
          item[field] = result
        }
      }
      return item
    }

    context.result.data = await simpleJoin(context.result.data)
    return context
  }
}