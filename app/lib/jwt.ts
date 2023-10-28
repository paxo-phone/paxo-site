import { sign, verify } from 'jsonwebtoken'

export default class JWT {
    public static sign(payload) {
        return sign(payload, process.env.APP_KEY, { expiresIn: "20m" })
    }

    public static verify(payload) {
        return verify(payload, process.env.APP_KEY)
    }
}