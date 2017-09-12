const Hapi = require('hapi');
const server = new Hapi.Server();
const facebookFormat = require('./chatBotFacebookFormat');
const questions = require('./questions.json');


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

server.start( (err) => {
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

    if (messageText && messageText == '#meajudapaulo') {
        initChat(senderID);
    }
}


function initChat( senderID ){
    facebookFormat.sendImageMessage( senderID, "https://petersapparel.com/img/shirt.png");
    let info = data.questions.filter((c)=>  !c.ref_payload )[0];
    facebookFormat.sendButtonMessage( senderID, { title: info.question, buttons: info.answers });
    facebookFormat.sendListMessage( senderID, {} );
}


function receivedPostback(event) {
    let senderID = event.sender.id;
    let recipientID = event.recipient.id;
    let timeOfPostback = event.timestamp;
    let payload = event.postback.payload;

    checkQuestion( payload, ( err, response ) => {
        if (err) throw err;

        if( response.type == "text" ){
            facebookFormat.sendTextMessage(senderID, response.text );
        } else if( response.type == "button" ){
            facebookFormat.sendButtonMessage( senderID, { title: response.question, buttons: response.answers })
        } else if( response.type == "list" ){
            // facebookFormat.sendListMessage( senderID, {} );
        } else if( response.type == "final" ){

        }
    })
}


function checkQuestion( payload ){

    let question = questions.filter( (c)=> c.ref_payload == payload )[0];
    if( typeof question == "undefined" ){
        callback( "acabou", false );
    }else{
        callback( false, question );
    }

}
