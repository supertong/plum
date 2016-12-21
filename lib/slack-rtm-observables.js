const Rx = require('rxjs/Rx')
const RtmClient = require('@slack/client').RtmClient
const CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS
const RTM_EVENTS = require('@slack/client').RTM_EVENTS

const homeChannel = 'C0VETUCJD'
const mentionSyntax = '<@U3HFWPPFH>'
const bot_token = process.env.SLACK_BOT_TOKEN || ''

const rtm = new RtmClient(bot_token)
let READY = 0

const connectionOpenObservable = Rx.Observable.create((observer) => {
  rtm.on(CLIENT_EVENTS.RTM.CONNECTING, function() {
    console.log(`Connecting to Slack server..`)
  })

  // The client will emit an RTM.AUTHENTICATED event on successful connection, with the `rtm.start` payload if you want to cache it
  rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, function (rtmStartData) {
    console.log(`Logged in as ${rtmStartData.self.name} of team ${rtmStartData.team.name}`)
  })

  // you need to wait for the client to fully connect before you can send messages
  rtm.on(CLIENT_EVENTS.RTM.RTM_CONNECTION_OPENED, function () {
    console.log('Connected')
    rtm.sendMessage("汪汪汪！！", homeChannel)
    READY = 1
    observer.next()
  })

  rtm.start()

  return () => {
    console.log('disconnect called')
    rtm.disconnect()
  }
})

const messageObservable = Rx.Observable.create((observer) => {
  const listener = (message) => {
    /*
      message is like
      {
        type: 'message',
        channel: 'xxxx',
        user: 'yyyy',
        text: 'fuck',
        ts: '1482207136.000018',
        team: 'zzzzz'
      }
    */
    const directMention = new RegExp(mentionSyntax, 'ig')
    if (directMention.test(message.text)) {
      observer.next(message)
    }
  }
  rtm.on(RTM_EVENTS.MESSAGE, listener)

  // unsubscribe
  return () => {
    rtm.removeListener(RTM_EVENTS.MESSAGE, listener)
  }
})

// Used to send message
const sendMessageObserver = {
  next: ({ message, channel }) => {
    if (READY)
      rtm.sendMessage(message, channel || homeChannel)
    else
      console.log('Socket not ready!')
  }
}

// Create an AnonymousSubject
const messageSubject = Rx.Subject.create(sendMessageObserver, messageObservable)
messageSubject.send = messageSubject.next

module.exports = {
  connectionOpenObservable,
  messageSubject,
}
