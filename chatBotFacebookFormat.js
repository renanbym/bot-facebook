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
                console.error("Unable to send message.");
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
                                "title": "Classic T-Shirt Collection",
                                "subtitle": "See all our colors",
                                "image_url": "https://peterssendreceiveapp.ngrok.io/img/collection.png",
                                "buttons": [
                                    {
                                        "title": "View",
                                        "type": "web_url",
                                        "url": "https://peterssendreceiveapp.ngrok.io/collection",
                                        "messenger_extensions": true,
                                        "webview_height_ratio": "tall",
                                        "fallback_url": "https://peterssendreceiveapp.ngrok.io/"
                                    }
                                ]
                            },
                            {
                                "title": "Classic White T-Shirt",
                                "subtitle": "See all our colors",
                                "default_action": {
                                    "type": "web_url",
                                    "url": "https://peterssendreceiveapp.ngrok.io/view?item=100",
                                    "messenger_extensions": true,
                                    "webview_height_ratio": "tall",
                                    "fallback_url": "https://peterssendreceiveapp.ngrok.io/"
                                }
                            },
                            {
                                "title": "Classic Blue T-Shirt",
                                "image_url": "https://peterssendreceiveapp.ngrok.io/img/blue-t-shirt.png",
                                "subtitle": "100% Cotton, 200% Comfortable",
                                "default_action": {
                                    "type": "web_url",
                                    "url": "https://peterssendreceiveapp.ngrok.io/view?item=101",
                                    "messenger_extensions": true,
                                    "webview_height_ratio": "tall",
                                    "fallback_url": "https://peterssendreceiveapp.ngrok.io/"
                                },
                                "buttons": [
                                    {
                                        "title": "Shop Now",
                                        "type": "web_url",
                                        "url": "https://peterssendreceiveapp.ngrok.io/shop?item=101",
                                        "messenger_extensions": true,
                                        "webview_height_ratio": "tall",
                                        "fallback_url": "https://peterssendreceiveapp.ngrok.io/"
                                    }
                                ]
                            }
                        ]
                    }
                }
            }
        };

        Model.sendAPI(messageData);

    }

}

module.exports = Model
