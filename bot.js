const TelegramBot = require('node-telegram-bot-api')
const fs = require('fs')
const schedule = require('node-schedule')

const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')

const adapter = new FileSync('users.json')
const db = low(adapter)

db.defaults({users: []}).write()

const token = fs.readFileSync('token.txt', 'utf8').trim()

const bot = new TelegramBot(token, {polling: true});

const dates = [
	{hour: 8, minute: 0, dayOfWeek: 2},
	{hour: 10, minute: 0, dayOfWeek: 4},
]

const titles = [
	"consagrado", "sobrecarregado", "patrão", "paladino", "vingador", "estudante"
]

const makeMessage = () => {
	return "Marca a presença de conceitos, meu " + titles[Math.floor(Math.random() * titles.length)]
}

const sendAlert = () => {
	const users = db.get('users').value()
	for (let i in users) {
		const user = users[i]
		bot.sendMessage(user, makeMessage())
	}
}

for (var i in dates) {
	dates[i] = schedule.scheduleJob(dates[i], () => {
		sendAlert()
	})
}

bot.on('message', (msg) => {
	const users = db.get('users').value()
	if (!users.includes(msg.chat.id)) {
		db.get('users').push(msg.chat.id).write()
	}
})
