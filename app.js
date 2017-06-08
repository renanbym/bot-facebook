const Hapi = require('hapi');
const server = new Hapi.Server();
const request = require('request');


server.connection({
    host:  '0.0.0.0',
    port: (process.env.PORT || 3000)
});


server.route({
    method: 'GET',
    path:'/',
    handler:  (request, reply) =>  {
        return reply({'ola': 'pessoal'}).code(200);
    }
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

            // Iterate over each entry - there may be multiple if batched
            data.entry.forEach( (entry) => {
                let pageID = entry.id;
                let timeOfEvent = entry.time;

                // Iterate over each messaging event
                entry.messaging.forEach( (event) => {
                    if (event.message) {
                        receivedMessage(event);
                    } else {
                        console.log("Webhook received unknown event: ", event);
                    }
                });
            });

            // Assume all went well.
            //
            // You must send back a 200, within 20 seconds, to let us know
            // you've successfully received the callback. Otherwise, the request
            // will time out and we will keep trying to resend.
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

    console.log("Received message for user %d and page %d at %d with message:",
    senderID, recipientID, timeOfMessage);
    console.log(JSON.stringify(message));

    let messageId = message.mid;

    let messageText = message.text;
    let messageAttachments = message.attachments;

    if (messageText) {

        // If we receive a text message, check to see if it matches a keyword
        // and send back the example. Otherwise, just echo the text we received.
        switch (messageText) {
            case 'agenda':
            sendGenericMessage(senderID);
            break;

            case '#receita':
            sendRecipeMessage( senderID );
            break;

            default:
            sendTextMessage(senderID, messageText);
        }
    } else if (messageAttachments) {
        sendTextMessage(senderID, "Message with attachment received");
    }
}





function sendRecipeMessage( recipientId ){

    request({
        uri: 'http://tennessee.herokuapp.com/rest/receitas',
        method: 'GET'
    }, function (error, response, body) {
        if (!error && response.statusCode == 200) {

            var data = JSON.parse( body );

            let recipies  = data.dados.map(function(c){
                let obj = new Object();

                obj.title = c.titulo
                obj.subtitle = c.tempo+" Minutos - Serve "+c.porcoes+" pessoas"
                obj.item_url = "http://tennessee.herokuapp.com/receitas-detalhe/"+c.slug
                obj.image_url = c.thumb
                obj.buttons = [{type: "web_url",url:"http://tennessee.herokuapp.com/receitas-detalhe/"+c.slug,title: "Ver receita"}]

                return obj;
            })


            let messageData = {
                recipient: {
                    id: recipientId
                },
                message: {
                    attachment: {
                        type: "template",
                        payload: {
                            template_type: "generic",
                            elements: recipies
                        }
                    }
                }
            }
            callSendAPI(messageData);
        }
    });

}

function sendGenericMessage(recipientId) {
    let messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            attachment: {
                type: "template",
                payload: {
                    template_type: "generic",
                    elements: [{
                        title: "QUINTA-FEIRA 15/06",
                        subtitle: "CAU E DEBORAH",
                        item_url: "http://www.villacountry.com.br/programacao_interno_descricao.php?id=51&c_data=20170615#Agenda",
                        image_url: "http://www.villacountry.com.br/upload/artista/51.jpg",
                        buttons: [{
                            type: "web_url",
                            url: "http://www.villacountry.com.br/programacao_interno_descricao.php?id=51&c_data=20170615#Agenda",
                            title: "Comprar ingresso"
                        }],
                    }, {
                        title: "GIANCARLO e JULIANO",
                        subtitle: "SEXTA-FEIRA 16/06",
                        item_url: "http://www.villacountry.com.br/programacao_interno_descricao.php?id=21&c_data=20170616#Agenda",
                        image_url: "http://www.villacountry.com.br/upload/artista/21.jpg",
                        buttons: [{
                            type: "web_url",
                            url: "http://www.villacountry.com.br/programacao_interno_descricao.php?id=21&c_data=20170616#Agenda",
                            title: "Comprar ingresso"
                        }]
                    }]
                }
            }
        }
    };

    callSendAPI(messageData);
}

function sendTextMessage(recipientId, messageText) {
    let messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            text: messageText
        }
    };

    callSendAPI(messageData);
}

function callSendAPI(messageData) {
    request({
        uri: 'https://graph.facebook.com/v2.6/me/messages',
        qs: { access_token: "EAAFeD6i9wa4BAM7BEL1naCbZCPqGujLhIWiSp2ZAZAlmcew0ROJtxbUfZCvVpv49D4L29xUwUWoOkz2rEjq4TWJ0mCWxnJq4fuGGEal0TXA7eswzlWqQjLaH7hu5XUpQDl35IHC6ZBtwfcxZBuEw413vaZAUrOAIbZCPXoNOtUbuZCwZDZD" },
        method: 'POST',
        json: messageData

    }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            let recipientId = body.recipient_id;
            let messageId = body.message_id;

            console.log("Successfully sent generic message with id %s to recipient %s",
            messageId, recipientId);
        } else {
            console.error("Unable to send message.");
            console.error(response);
            console.error(error);
        }
    });
}
