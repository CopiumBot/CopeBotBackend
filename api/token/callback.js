export default async function CallbackHandler(req, res)
{
    const REDIRECT_URI = "https://copiumbot.github.io";

    res.setHeader("Access-Control-Allow-Origin", REDIRECT_URI);
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    
    if(req.method === "OPTIONS")
        return res.status(200).end();

    if(req.method !== "POST")
    {
        return res.status(405).json(
        {
            error: "Method not allowed"
        });
    }

    const { platform } = req.query;
    const { code, state, code_verifier } = req.body;

    if(!platform || !code || !state)
    {
        return res.status(400).json(
        {
            error: "Missing required parameters"
        });
    }
        
    if(platform === "kick")
    {
        if(!code_verifier)
        {
            return res.status(400).json(
            {
                error: "Missing required parameters"
            });
        }

        try
        {
            const response = await fetch("https://id.kick.com/oauth/token",
            {
                method: "POST",
                headers:
                {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: new URLSearchParams(
                {
                    grant_type: "authorization_code",
                    client_id: process.env.KICK_CLIENTID,
                    client_secret: process.env.KICK_CLIENTSECRET,
                    redirect_uri: REDIRECT_URI + "/kick",
                    code_verifier,
                    code
                })
            });

            if(!response.ok)
            {
                const errorText = await response.text();
                return res.status(response.status).json(
                {
                    error: "External API error",
                    message: errorText
                });
            }

            const tokenData = await response.json();
            res.status(200).json(tokenData);
        }
        catch(error)
        {
            res.status(500).json(
            {
                error: "Server error",
                message: error.message
            })
        }
    }
    else if(platform === "twitch")
    {
        try
        {
            const response = await fetch("https://id.twitch.tv/oauth2/token",
            {
                method: "POST",
                headers:
                {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: new URLSearchParams(
                {
                    grant_type: "authorization_code",
                    client_id: process.env.TWITCH_CLIENTID,
                    client_secret: process.env.TWITCH_CLIENTSECRET,
                    redirect_uri: REDIRECT_URI + "/twitch",
                    code
                })
            });

            if(!response.ok)
            {
                const errorText = await response.text();
                return res.status(response.status).json(
                {
                    error: "External API error",
                    message: errorText
                });
            }

            const tokenData = await response.json();
            tokenData.state = state;
            res.status(200).json(tokenData);
        }
        catch(error)
        {
            res.status(500).json(
            {
                error: "Server error",
                message: error.message
            })
        }
    }
    else
    {
        return res.status(400).json(
        {
            error: "Unsupported platform"
        });
    }
}