export default async function RefreshHandler(req, res)
{
    res.setHeader("Access-Control-Allow-Origin", "https://copiumbot.github.io");
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
    const { refresh_token  } = req.body;

    if(!platform || !refresh_token)
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
                    grant_type: "refresh_token",
                    client_id: process.env.KICK_CLIENTID,
                    client_secret: process.env.KICK_CLIENTSECRET,
                    refresh_token
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