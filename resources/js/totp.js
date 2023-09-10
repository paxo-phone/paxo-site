const generateQR = require('qrcode').toCanvas

window.addEventListener('DOMContentLoaded', () => {
    generateQR(document.getElementById("qrcode"), document.getElementById("totp-token").getAttribute("href"), (err) => {
        if (err) console.error(err)
    })
})