function encrypt(msg){
    return CryptoJS.AES.encrypt(msg, "Secret Passphrase").toString()
}

function decrypt(ciphertext){
    return CryptoJS.AES.decrypt(ciphertext, "Secret Passphrase").toString(CryptoJS.enc.Utf8)
}

