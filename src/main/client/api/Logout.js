import { net } from 'electron';

exports.call = function(event, portNumber) {
  const req = net.request({
    method: 'POST',
    protocol: 'http:',
    hostname: '127.0.0.1',
    port: portNumber,
    path: '/v1/wallet/owner/logout'
  });
  req.setHeader('session_token', global.session_token);
  req.on('response', (response) => {
    global.session_token = null;
  });
  req.end();
}
