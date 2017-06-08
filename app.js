const Hapi = require('hapi');
const server = new Hapi.Server();

const HLTV = require('hltv');
const hltv = new HLTV();

server.connection({
    host:  '0.0.0.0',
    port: (process.env.PORT || 3000)
});


server.route({
    method: 'GET',
    path:'/',
    handler:  (request, reply) =>  {
        return reply({'ola': 'peddoal'}).code(200);
    }
});

server.route({
    method: 'GET',
    path:'/webhook',
    handler:  (request, reply) =>  {
        console.log(request.query);
        if (request.query['hub.mode'] === 'subscribe' && request.query['hub.verify_token'] === 'vamosvencer') {
            return reply(request.query['hub.challenge']).code(200);
        } else {
            return reply().code(403);
            console.error("Failed validation. Make sure the validation tokens match.");
        }


    }
});

server.route({
    method: 'POST',
    path:'/webhook',
    handler:  (request, reply) =>  {
        return reply({'so': 'vai'}).code(200);
    }
});

server.start((err) => {
    if (err) throw err;
    console.log('Server running at:', server.info.uri);
});
