const libs = require('libsodium-wrappers');
const Decryptor = require('../src/Decryptor');
const Encryptor = require('../src/Encryptor');
client = null;
server = null;


module.exports = async () => {

    await libs.ready;
    var havePeers = null;

    if (server == null) 
    {
        havePeers = false;
        var keys = libs.crypto_kx_keypair();

        server = 
        {
          publicKey: keys.publicKey, privateKey: keys.privateKey
        
        }

    }


    else {
        havePeers = true;

        var keys = libs.crypto_kx_keypair();
        const keysForClient = libs.crypto_kx_client_session_keys(keys.publicKey, keys.privateKey, server.publicKey);
        const keysForServer = libs.crypto_kx_server_session_keys(server.publicKey, server.privateKey, keys.publicKey);


        client = 
        {
          privateKey: keys.privateKey, publicKey: keys.publicKey,decryptor: await Decryptor(keysForClient.sharedRx),
          encryptor: await Encryptor(keysForClient.sharedTx)
        };

        server.decryptor = await Decryptor(keysForServer.sharedRx);
        server.encryptor = await Encryptor(keysForServer.sharedTx);
    } 



    return Object.freeze({
        publicKey: havePeers ? client.publicKey : server.publicKey,
        send: (msg) => 
        {

          havePeers ? server.message = client.encryptor.encrypt(msg) : client.message = server.encryptor.encrypt(msg);
        },


        receive: () => 
        {
            if (havePeers) 
            {
                msg = client.message;
                return client.decryptor.decrypt(msg.ciphertext, msg.nonce);
            } 
            else 
            {
                msg = server.message;
                return server.decryptor.decrypt(msg.ciphertext, msg.nonce);
            }
        },


        encrypt: (msg) => 
        {
            var answer = null
            havePeers ? answer = client.encryptor.encrypt(msg) : answer = server.encryptor.encrypt(msg);

            return answer;
        },


        decrypt:(ciphertext, nonce) =>
            {
              return client.decryptor.decrypt(ciphertext, nonce)
            }
    }); };
