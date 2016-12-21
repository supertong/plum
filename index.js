const connectionOpenObservable = require('./lib/slack-rtm-observables').connectionOpenObservable
const messageSubject = require('./lib/slack-rtm-observables').messageSubject

const shane = 'U0VEPBHD3'

connectionOpenObservable.subscribe({
  next: () => {}
})

messageSubject.subscribe({
  next: (message) => {
    if (message.user === 'U0VEPBHD3')
      messageSubject.send({ message: "喵～", channel: message.channel })
    else
      messageSubject.send({ message: '汪汪汪！！', channel: message.channel })
  }
})
