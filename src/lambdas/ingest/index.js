const { default: got } = require('got')
const esClient = require('../../lib/esClient.js')
const stream = require('../../lib/esStream.js')
const ingest = require('../../lib/ingest.js')
const s3Utils = require('../../lib/s3-utils')

const isSqsEvent = (event) => 'Records' in event

const isSnsMessage = (record) => record.Type === 'Notification'

const stacItemFromSnsMessage = async (message) => {
  if ('href' in message) {
    const { protocol, hostname, pathname } = new URL(message.href)

    if (protocol === 's3:') {
      return await s3Utils.getObjectJson({
        bucket: hostname,
        key: pathname.replace(/^\//, '')
      })
    }

    if (protocol.startsWith('http')) {
      return await got.get(message.href, {
        resolveBodyOnly: true
      }).json()
    }

    throw new Error(`Unsupported source: ${message.href}`)
  }

  return message
}

const stacItemFromRecord = async (record) => {
  const recordBody = JSON.parse(record.body)

  return isSnsMessage(recordBody)
    ? await stacItemFromSnsMessage(JSON.parse(recordBody.Message))
    : recordBody
}

const stacItemsFromSqsEvent = async (event) => {
  const records = event.Records

  return await Promise.all(
    records.map((r) => stacItemFromRecord(r))
  )
}

module.exports.handler = async function handler(event, context) {
  const { logger = console } = context

  logger.debug(`Event: ${JSON.stringify(event, undefined, 2)}`)

  if (event.create_indices) {
    await esClient.createIndex('collections')
  }

  const stacItems = isSqsEvent(event)
    ? await stacItemsFromSqsEvent(event)
    : [event]

  try {
    await ingest.ingestItems(stacItems, stream)
    logger.info(`Ingested ${stacItems.length} Items: ${JSON.stringify(stacItems)}`)
  } catch (error) {
    console.log(error)
    throw (error)
  }
}
