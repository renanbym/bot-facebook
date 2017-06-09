const Hapi = require('hapi');
const config = require('./config.json');

const server = new Hapi.Server();
const request = require('request');


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

    let messageId = message.mid;

    let messageText = message.text;
    let messageAttachments = message.attachments;

    if (messageText) {

        let msg = messageText.match(/([mM][eE]\s?[Aa]jud[aA]|[aA]gend[aA]|[vV][aA][mM][oO][sS]\s?[vV]ence[Rr]|[rR]eceitas?|[sS]exta\-?\s?[fF]eira)/gi);

        if( msg != null ){
            if( msg.length > 0 ){
                msg = msg[0].toLowerCase();
            }else{
                msg = messageText;
            }
        }else{
            msg = messageText;
        }


        switch ( msg ) {
            case 'agenda':
            sendGenericMessage(senderID);
            break;

            case 'receita':
            sendRecipeMessage( senderID );
            break;

            case 'vamos vencer':
            sendVamosVencerMessage( senderID );
            break;

            case 'me ajuda':
            sendMeAjuda( senderID );
            break;

            case 'tudo bem?':
            sendTextMessage( senderID, 'Tudo e você !?' );
            break;

            case 'sexta-feira':
            case 'sexta feira':
            sendTextMessage( senderID, 'dia de colocar picanha na marmita de vegetariano' );
            sendTextMessage( senderID, 'dia de comer sushi com garfo e faca ' );
            sendTextMessage( senderID, 'dia de pedir um gole de yakult' );
            sendTextMessage( senderID, 'dia de maldade' );
            break;

            default:
            sendTextMessage(senderID, messageText);
        }
    } else if (messageAttachments) {
        sendTextMessage(senderID, "Message with attachment received");
    }
}


function sendVamosVencerMessage( recipientId ){
    request({
        uri: 'http://f2f-digital.com/api/midia',
        method: 'GET'
    }, function (error, response, body) {
        if (!error && response.statusCode == 200) {

            var data = JSON.parse( body );

            let recipies  = data.dados.map(function(c){
                let obj = new Object();

                obj.title = c.titulo
                obj.subtitle = c.autor+" - "+c['data-formatada']
                obj.item_url = c.link
                obj.image_url = c['caminho-thumb']
                obj.buttons = [{type: "web_url",url:c.link ,title: "Ver Link"}]

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
    })
}

function sendMeAjuda( recipientId ){


    let messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            attachment: {
                type: "template",
                "payload":{
                    "template_type":"button",
                    "text":"Vai com calma e escolha ai!",
                    "buttons":[
                        {
                            "type":"web_url",
                            "url":"https://get.uber.com/new-signup/",
                            "title":"Assim cê chega em casa"
                        }
                        ,{
                            "type":"web_url",
                            "url":"https://open.spotify.com/user/12142916469/playlist/2fMc4QaiUZsX3AwB7Ypn32",
                            "title":"Pega litrão e o lenço"
                        }
                        ,{
                            "type":"web_url",
                            "url":"https://www.skyscanner.com.br/passagens-aereas-para/las/passagens-aereas-promocionais-para-las-vegas-mccarran-aeroporto.html",
                            "title":"Só vai"
                        }
                    ]
                }

            }
        }
    };

    callSendAPI(messageData);

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
        qs: { access_token: config.access_token },
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
