export default async function CallbackHandler(req, res)
{
    if(req.method !== "POST")
    {
        return res.status(405).json(
        {
            error: "Method not allowed"
        });
    }

    const { platform } = req.query;
    const { code, state, codeChallenge } = req.body;

    if(!platform || !code || !state || !codeChallenge)
    {
        return res.status(400).json(
        {
            error: "Missing required parameters"
        });
    }
        
    if(platform === "kick")
    {
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
                    client_id: process.env.CLIENTID,
                    client_secret: process.env.CLIENTSECRET,
                    redirect_uri: "https://copiumbot.github.io/kick",
                    code_verifier: codeChallenge,
                    code: code 
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
    /*else if(platform === "twitch")
    {

    }*/
    else
    {
        return res.status(400).json(
        {
            error: "Unsupported platform"
        });
    }
}