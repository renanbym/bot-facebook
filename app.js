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
    model.sendImageMessage( recipientId, "https://petersapparel.com/img/shirt.png");
    sendGenericMessage( recipientId );
}

function sendGenericMessage(recipientId) {
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            attachment: {
                type: "template",
                payload: {
                    template_type: "button",
                    text: "Sobre o que você que saber ?",
                    buttons: [{
                        type: "postback",
                        title: "Inscrições",
                        payload: "Payload inscriçao",
                    },{
                        type: "postback",
                        title: "O desafio",
                        payload: "Payload desafio",
                    }]
                }
            }
        }
    };

    model.sendAPI(messageData);
}


function receivedPostback(event) {
    var senderID = event.sender.id;
    var recipientID = event.recipient.id;
    var timeOfPostback = event.timestamp;


    var payload = event.postback.payload;

    console.log("Received postback for user %d and page %d with payload '%s' " +
    "at %d", senderID, recipientID, payload, timeOfPostback);

    model.sendTextMessage(senderID, "Postback called");
}
