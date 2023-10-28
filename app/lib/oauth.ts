import axios from "axios"

export enum OauthService {
    GOOGLE,
    GITHUB
}

export const OauthServiceConfig = [
    {
        name: "Google",
        column: "google_id",
        authorization_uri: "https://accounts.google.com/o/oauth2/v2/auth?"
            + "redirect_uri=" + encodeURIComponent(process.env.ACCESS_ADDRESS + "/oauth/google") + "&"
            + "prompt=select_account&"
            + "response_type=code&"
            + "client_id=" + process.env.GOOGLE_CLIENT_ID + "&"
            + "scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.profile+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email&"
            + "access_type=online",
        user_data_endpoint: "about:blank",

        async getMinimalData(code) {
            // Fetch access token
            const access_token = (await axios.post("https://oauth2.googleapis.com/token", {}, {
                headers: { Accept: 'application/json' },
                params: {
                    client_id: process.env.GOOGLE_CLIENT_ID,
                    client_secret: process.env.GOOGLE_CLIENT_SECRET,
                    code,
                    redirect_uri: process.env.ACCESS_ADDRESS + "/oauth/google",
                    grant_type: "authorization_code"
                }
            })).data["access_token"]

            // Get user info
            const user_data = (await axios.get("https://www.googleapis.com/oauth2/v1/userinfo", {
                headers: {
                    Accept: 'application/json',
                    Authorization: "Bearer " + access_token
                }
            })).data

            return {
                profile: {
                    google_id: +user_data.id,
                    picture: user_data.picture,
                    email: user_data.email
                },
                username: user_data.name,
                id: +user_data.id,
                token: access_token
            }
        }
    },
    {
        name: "Github",
        column: "github_id",
        authorization_uri: "https://github.com/login/oauth/authorize?"
            + "redirect_uri=" + encodeURIComponent(process.env.ACCESS_ADDRESS + "/oauth/github") + "&"
            + "client_id=" + process.env.GITHUB_CLIENT_ID + "&"
            + "scope=read:user,user:email",
        user_data_endpoint: "https://api.github.com/user",

        async getMinimalData(code) {
            // Fetch access token
            const token_raw = (await axios.post("https://github.com/login/oauth/access_token", {}, {
                headers: { Accept: 'application/json' },
                params: {
                    client_id: process.env.GITHUB_CLIENT_ID,
                    client_secret: process.env.GITHUB_CLIENT_SECRET,
                    code,
                    redirect_uri: process.env.ACCESS_ADDRESS + "/oauth/github",
                }
            }))
            const token = token_raw.data["access_token"]

            // Get user info
            const user_data = (await axios.get("https://api.github.com/user", {
                headers: {
                    Accept: 'application/json',
                    Authorization: "Bearer " + token
                }
            })).data

            return {
                profile: {
                    github_id: user_data.id,
                    picture: user_data.avatar_url
                },
                username: user_data.login,
                id: user_data.id,
                token: token
            }
        },
        async completeProfile(data) {
            // Get emails
            const emails: object[] = (await axios.get("https://api.github.com/user/emails", {
                headers: {
                    Accept: 'application/json',
                    Authorization: "Bearer " + data.token
                }
            })).data
            data.profile.email = emails.filter((val) => val["primary"])[0]['email']
        }
    },
]