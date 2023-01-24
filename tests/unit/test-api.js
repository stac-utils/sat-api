// @ts-nocheck

import test from 'ava'
import { stub } from 'sinon'
import proxyquire from 'proxyquire'
import createEvent from 'aws-event-mocks'

test.skip('handler calls search with parameters', async (t) => {
  const result = { value: 'value' }
  const search = stub().resolves(result)
  const lambda = proxyquire('../../src/lambdas/api/', {
  })
  const host = 'host'
  const httpMethod = 'GET'
  const path = 'path'

  const queryStringParameters = {
    test: 'test'
  }
  const event = createEvent({
    template: 'aws:apiGateway',
    merge: {
      headers: {
        Host: host,
        'Accept-Encoding': ''
      },
      requestContext: {},
      httpMethod,
      queryStringParameters,
      path
    }
  })

  const actual = await lambda.handler(event)
  const { args } = search.firstCall
  t.is(args[0], path)
  t.deepEqual(args[1], queryStringParameters)
  t.is(args[3], `https://${host}`)
  t.is(actual.statusCode, 200)
  t.is(actual.body, JSON.stringify(result))
})

test.skip('handler returns 404 for error', async (t) => {
  const errorMessage = 'errorMessage'
  const lambda = proxyquire('../../src/lambdas/api/', {
  })
  const host = 'host'
  const httpMethod = 'GET'
  const path = 'path'

  const queryStringParameters = {
    test: 'test'
  }
  const event = createEvent({
    template: 'aws:apiGateway',
    merge: {
      headers: {
        Host: host,
        'Accept-Encoding': ''
      },
      requestContext: {},
      httpMethod,
      queryStringParameters,
      path
    }
  })

  const actual = await lambda.handler(event)
  t.is(actual.statusCode, 404)
  t.is(actual.body, errorMessage)
})
