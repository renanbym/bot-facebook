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
        return reply('{ola': 'peddoal').code(200);
    }
});

server.start((err) => {
    if (err) throw err;
    console.log('Server running at:', server.info.uri);
});
