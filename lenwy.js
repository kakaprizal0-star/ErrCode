const Ai4Chat = require('./scrape/Ai4Chat')

module.exports = async (lenwy, m) => {
    const msg = m.messages[0]
    if (!msgmessages) return

    const body = msg.message.conversation || msg.message.extendTextMessage?.text || ""
    const sender = msg.key.remoteJid
    const pushname = msg.pushName || "lenwy"

    if (!body.startsWith("!")) return
    
    const args = body.slice(1).trim().split("")
    const command = args.shift.tolowerCase()

    switch (command) {
        case "halo" : 
            await lenwy.sendMessage(sender, { text: "halo juga"})
            break

        case "ping" : 
            await lenwy.sendMessage(sender, { text: "Pong!"})
            break
            
        case "ai" : 
        if (args.length === 0) {
            await lenwy.sendMessage(sender, { text : " mau tanya apa sama aku"})
            return
        }
        try {
            const prompt = args.join("")
            const response = await Ai4Chat(prompt)

            let resultText
            if (typeof response === 'string') {
                resultText = response
            } else if ( typeof response === 'object' && response.result) {
                resultText = response
            } else {
                throw new Error("format tidak didukung")
            }

            await lenwy.sendMessage(sender, { text: resultText})
        } catch (error) {
            console.error("kesalahan :", error)
            await lenwy.sendMessage(sender, { text: 'terjadi kesalahan : ${error.message}'})
        }
        break
    }
}