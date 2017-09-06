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
                console.error(response);
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

    ,sendImageMessage: ( recipientId, messageImage, messageText) => {
        let messageData = {
            recipient: {
                id: recipientId
            },
            message: {
                text: messageText,
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

}

module.exports = Model