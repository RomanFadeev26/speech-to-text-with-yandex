const jose = require('node-jose');
const fs = require('fs');

const privateKey = fs.readFileSync(require.resolve('../private.pem'));

const keyId = 'ajef6v4vsibimde7ulkm';


async function createJWT() {
    const now = Math.floor((new Date().getTime()) / 1000);

    const payload = {
        iss: 'ajer2lqufoaf562j8ltv',
        aud: 'https://iam.api.cloud.yandex.net/iam/v1/tokens',
        iat: now,
        exp: now + 3600
    };

    const sign = await jose.JWK.asKey(privateKey, 'pem', { kid: keyId, alg: 'PS256' });
    return jose.JWS.createSign({ format: 'compact' }, sign)
        .update(JSON.stringify(payload))
        .final();
}

module.exports = createJWT;
