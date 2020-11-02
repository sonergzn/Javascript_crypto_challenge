const nacl = require('libsodium-wrappers');
const Decryptor = require('./Decryptor');
const Encryptor = require('./Encryptor');



module.exports = async (peer) => {
    await nacl.ready;
    const keypr = nacl.crypto_kx_keypair();
 
    let p2;
    let msg;
    let tx, rx;
    let encryptor, decryptor
    let obj = Object.freeze({
       publicKey: keypr.publicKey,


       encrypt: (msg) => 
       {
            return encryptor.encrypt(msg);
       },

       decrypt: (ciphertext, nonce) => 
       {
            return decryptor.decrypt(ciphertext, nonce);
       },

       tMsg: (_msg) => 
       {
        msg = _msg;
       },

       send: (msg) => 
       {
        p2.tMsg(obj.encrypt(msg));
       },

       receive: () => 
       {
            return obj.decrypt(msg.ciphertext, msg.nonce);
       },


       generateSharedKeys: async (peer) => 
       {
        p2 = peer;      
        const secKey = nacl.crypto_kx_server_session_keys(keypr.publicKey, keypr.privateKey, p2.publicKey);
        rx = secKey.sharedRx;
        tx = secKey.sharedTx;
        decryptor = await Decryptor(rx);
        encryptor = await Encryptor(tx);
        }

    });


    if (peer) 
    {
        p2 = peer;
        const ckeys = nacl.crypto_kx_client_session_keys(keypr.publicKey, keypr.privateKey, p2.publicKey);
        rx = ckeys.sharedRx;
        decryptor = await Decryptor(rx);
        tx = ckeys.sharedTx;
        encryptor = await Encryptor(tx);
        p2.generateSharedKeys(obj);
    }


    return obj;
}
