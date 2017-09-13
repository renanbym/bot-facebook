const request = require('request');
const config = require('./config.json');

const Model = {

    sendAPI:  (messageData) => {
        request({
            uri: 'https://graph.facebook.com/v2.6/me/messages',
            qs: { access_token: config.access_token },
            method: 'POST',
            json: messageData
        },  (error, response, body) => {
            if (!error && response.statusCode == 200) {
                console.log("Successfully sent generic message with id %s to recipient %s",body.message_id, body.recipient_id);
            } else {
                console.error("[ERROR] Unable to send message.");
                console.error(body.error.message);
                console.error(error);
            }

        });
    }

    ,sendTextMessage:  (recipientId, messageText) => {
        let messageData = {
            recipient: {
                id: recipientId
            },
            message: {
                text: messageText
            }
        };

        Model.sendAPI(messageData);
    }

    ,sendImageMessage: ( recipientId, messageImage) => {
        let messageData = {
            recipient: {
                id: recipientId
            },
            message: {
                attachment:{
                    type:"image",
                    payload:{
                        url: messageImage
                    }
                }
            }
        };
        Model.sendAPI(messageData);
    }

    ,sendButtonMessage: ( recipientId, params ) => {
        let messageData = {
            recipient: {
                id: recipientId
            },
            message: {
                attachment: {
                    type: "template",
                    payload: {
                        template_type: "button",
                        text: params.title,
                        buttons: params.buttons.map((c) => { c.type = "postback"; return c; })
                    }
                }
            }
        };
        Model.sendAPI(messageData);
    }

    ,sendListMessage: ( recipientId, params ) => {
        let messageData = {
            recipient: {
                id: recipientId
            },
            message: {
                attachment: {
                    type: "template",
                    payload: {
                        template_type: "list",
                        top_element_style: "compact",
                        "elements": [
                            {
                                "title": "Classic White T-Shirt #1",
                                "subtitle": "See all our colors",
                                "default_action": {
                                    "type": "postback",
                                    "payload": "#teste2"
                                }
                            },
                            {
                                "title": "Classic White T-Shirt #2",
                                "subtitle": "See all our colors",
                                "default_action": {
                                    "type": "postback",
                                    "payload": "#teste2"
                                }
                            }
                        ]
                    }
                }
            }
        };
        console.log(messageData);
        Model.sendAPI(messageData);

    }

}

module.exports = Model
