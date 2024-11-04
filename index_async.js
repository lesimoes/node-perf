const express = require('express');
const { Session } = require('node:inspector/promises');
const fs = require('node:fs');

const crypto = require('node:crypto')
const app = express();
const PORT = 3000;
const session = new Session();
session.connect();

function delay () {
    return new Promise((res, _rej) => {
        const limit = 10_000_000;
        const primes = [];
        for (let number = 2; number <= limit; number++) {
            let isPrime = true;
            for (let i = 2; i <= Math.sqrt(number); i++) {
                if (number % i === 0) {
                    isPrime = false;
                    break;
                }
            }
            if (isPrime) {
                primes.push(number);
            }
        }
        res(primes.length)
    })
}

function encrypt() {
    return new Promise((res, rej) => {
        const salt = crypto.randomBytes(128).toString('base64');
        crypto.pbkdf2('RANDOM_TEXT', salt, 1_000_000, 512, 'sha512', (err, derivedKey) => {
            if (err) {
                rej(err);
            } else {
                res(Buffer.from(derivedKey).toString('base64'));
            }
        });
    });
}

app.get('/crypto', async (req, res) => {

    console.time('Time');
    await session.post('Profiler.enable');
    await session.post('Profiler.start');

    const promises = []
    const promiseEncrypt = encrypt()
    // const promiseDelay = delay();
    promises.push(promiseEncrypt);
    // promises.push(promiseDelay);

    promiseEncrypt.then(async result => {
        console.timeEnd('Time');
        const { profile } = await session.post('Profiler.stop');
        fs.writeFileSync('./profileIdle.cpuprofile', JSON.stringify(profile));
        return res.send(result).status(200);
    })




})

app.listen(PORT, () => {
    console.log(`Aplicação executando na porta: ${PORT}`);
})