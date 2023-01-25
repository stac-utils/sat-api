/* eslint-disable import/prefer-default-export */
import logger from '../../lib/logger.js'

export const handler = async (event, _context) => {
  logger.debug('Event: %j', event)

  const result = { ...event }

  if (event.statusCode === 200) {
    const body = JSON.parse(event.body)
    if (body['type'] === 'FeatureCollection') {
      logger.debug('Response is a FeatureCollection')
      // the set result.body to a string of a modified body
      // result.body = JSON.stringify(body)
    } else if (body['type'] === 'Feature') {
      logger.debug('Response is a Feature')
      // the set result.body to a string of a modified body
      // result.body = JSON.stringify(body)
    }
  }

  return result
}
