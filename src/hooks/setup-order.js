module.exports = function setupOrder (service) {
  return async context => {
    const legacy = await context.app.service(service)
      .action('first')
      .find({ query: { '$sort': { order: -1 }, '$limit': 1 }})
    context.data.order = legacy? legacy.order + 1 : 0
    return context
  }
}