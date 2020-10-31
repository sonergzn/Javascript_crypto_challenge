
const nacl = require('libsodium-wrappers')
module.exports = async () => {
    
    await nacl.ready
    let kPair = nacl.crypto_sign_keypair()



  return Object.freeze({
      
    verifyingKey: kPair.publicKey,

    sign: (m) => {

      return nacl.crypto_sign(m, kPair.privateKey)
    }
  }); };
