const express = require('express');
const { Session } = require('node:inspector/promises');
const fs = require('node:fs');

const crypto = require('node:crypto')
const app = express();
const PORT = 3000;
const session = new Session();
session.connect();

function delay () {
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

    return primes.length;
}

function encrypt () {
    const salt = crypto.randomBytes(128).toString('base64');
    const hash = crypto.pbkdf2Sync('RANDOM_TEXT', salt, 1_000_000, 512, 'sha512');
    return (Buffer.from(hash).toString('base64'))
}


app.get('/crypto', async (req, res) => {

    console.time('Time');
    await session.post('Profiler.enable');
    await session.post('Profiler.start');

    const results = [];
    const resultEncrypt = encrypt()
    const resultDelay = delay();
    results.push(resultEncrypt);
    results.push(resultDelay);

    console.timeEnd('Time');
    const { profile } = await session.post('Profiler.stop');
    fs.writeFileSync('./profileSync.cpuprofile', JSON.stringify(profile));
    return res.send(results).status(200);
})

app.listen(PORT, () => {
    console.log(`Aplicação executando na porta: ${PORT}`);
})