const { makeWAsocket, useMultiFileAuthState} = require("@whiskeysockets/bailyes")
const pino = require("pino")
const chalk = require("chalk")
const readline = require("path")

const usePairingCode = true
async function question(promt) {
    process.stdout.write(promt)
    const r1 = readline.createInterface({
        input : process.stdin,
        output : process.stdin,
    })

    return new Promise((resolve) => r1.question("", (ans) => {
        r1.close()
        resolve(ans)
    }))
}

async function connectToWhastApp() {
    console.log(chalk.blue(" memulai koneksi whatsapp"))

    const { state, saveCards } = await userMultiFikeAuthState("./lenwySesi")

    const lenwy = makeWAsocket({
        logger : pino ({level: "silent"}),
        printQRInTerminal : !usePairingCode,
        browser : ["ubuntu", "chrome", "20.0.04"],
        version : [2, 3000, 1015901307]
    })

    if(usePairingCode && !lenwy.authState.creds.registered) {
        console.log(chalk.green(" masukkan nomor dengan awal +62"))
        const phoneNumber = await question("> ")
        const code = await lenwy.requestPairingCode(phoneNumber.trim())
        console.log(chalk.cyan(`Pairing Code : ${code}`))
    }

    lenwy.ev.on("connection.update", (update) => {
        const { connection, lastDisconnect } = update
        if ( connection === "close") {
            console.log(chalk.red("koneksi terputus, mencoba menyambung ulang"))
            connectToWhatsApp()
        } else if ( connection === "open") {
            console.log(chalk.red("bot berhasil terhubung kle whatsApp"))
        }
    })

    lenwy.ev.on("creds.update", saveCreds)

    lenwy.ev.on("connection.update", (update) => {
        const { connection, lastDisconnect } = update
        if ( connection === " close") {
            console.log(chalk.red("koneksi terputus, mencoba menyambung ulang"))
            connectToWhastApp    
        } else if ( connection === "open") {
            console.log(chalk.red("bot berhasil terhubung ke whatsapp"))
        }
    })

    lenwy.ev.on("message.upsert", async (m) => {
        const msg = m.message[0]

        if (!msg.message) return

        const body = msg.message.conversation || msg.message.extendTextMessage?.text || ""
        const sender = msg.key.remoteJid
        const pushname = msg.pushname || "lenwy"

        const listColor = ["red", "green", "yellow", "magenta", "cyan", "white", "blue"]
        const randomcolor = listColor[Math.floor(Math.random() * listColor.length)]

        console.log(
            chalk.yellow.bold("credit : lenwy"),
            chalk.green.bold("[ WhatsApp ]"),
            chalk[randomColor](pushname),
            chalk[randomColor](" : "),
            chalk.white(body)
        )

        require("./lenwy")(lenwy, m)
    })
}

connectToWhatsApp()