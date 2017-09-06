const Hapi = require('hapi');
const config = require('./config.json');

const server = new Hapi.Server();
const request = require('request');
const model = require('./model');


server.connection({
    host:  '0.0.0.0',
    port: (process.env.PORT || 3000)
});


server.route({
    method: 'GET',
    path:'/webhook',
    handler:  (request, reply) =>  {

        if (request.query['hub.mode'] === 'subscribe' && request.query['hub.verify_token'] === 'vamosvencer') {
            return reply(request.query['hub.challenge']).code(200);
        } else {
            console.error("Failed validation. Make sure the validation tokens match.");
            return reply().code(403);
        }


    }
});

server.route({
    method: 'POST',
    path:'/webhook',
    handler:  (request, reply) =>  {

        let data = request.payload;

        if (data.object === 'page') {

            data.entry.forEach( (entry) => {
                let pageID = entry.id;
                let timeOfEvent = entry.time;

                entry.messaging.forEach( (event) => {
                    if (event.message) {
                        receivedMessage(event);
                    } else if (event.postback) {
                        receivedPostback(event);
                    } else {
                        console.log("Webhook received unknown event: ", event);
                    }
                });
            });


            return reply().code(200);
        }
    }
});

server.start((err) => {
    if (err) throw err;
    console.log('Server running at:', server.info.uri);
});


function receivedMessage(event)  {
    let senderID = event.sender.id;
    let recipientID = event.recipient.id;
    let timeOfMessage = event.timestamp;
    let message = event.message;

    let messageId = message.mid;

    let messageText = message.text;
    let messageAttachments = message.attachments;

    if (messageText) {

        let msg = messageText;

        switch ( messageText ) {
            case '#meajudapaulo':
            initChat(senderID);
            break;

            default:
            model.sendTextMessage(senderID, messageText);
            break;
        }
    } else if (messageAttachments) {
        model.sendTextMessage(senderID, "Message with attachment received");
    }
}


function initChat( recipientId ){
    model.sendImageMessage( recipientId, "https://petersapparel.com/img/shirt.png", "txt");
    model.sendButtonMessage( recipientId, {
        title: "Sobre o que você que saber ?",
        buttons: [{ title: "Inscrições", payload: "#inscricao" },{ title: "O desafio", payload: "#desafio" }]
    })
    sendGenericMessage( recipientId );
}


function receivedPostback(event) {
    let senderID = event.sender.id;
    let recipientID = event.recipient.id;
    let timeOfPostback = event.timestamp;

    let payload = event.postback.payload;

    switch ( payload ) {

        case '#inscricao':
        model.sendButtonMessage( senderID, {
            title: "",
            buttons: [{ title: "Como me inscrevo ?", payload: "#como_me_inscrevo" },{ title: "Posso participar sozinho ?", payload: "#posso_participar_sozinho" },{ title: "Existe limite de pessoas por grupo ?", payload: "#existe_limite_de_pessoas_por_grupo" }]
        })
        break;

        case "#como_me_inscrevo":
        model.sendTextMessage(senderID, "Vai no site pow!");
        break;

        default:
        console.log("Received postback for user %d and page %d with payload '%s' " +
        "at %d", senderID, recipientID, payload, timeOfPostback);
        model.sendTextMessage(senderID, "Postback called");
        break;
    }

}
