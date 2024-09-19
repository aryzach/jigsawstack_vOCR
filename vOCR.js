const { JigsawStack } = require("jigsawstack");
const http = require("http");
require('dotenv').config(); // Load environment variables from .env file


const jigsawstack = JigsawStack({
  apiKey: process.env.JIGSAWSTACK_API_KEY, // Access the API key from the .env file
});

const POST = async (request, response) => {
  try {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk.toString();
    });

    request.on("end", async () => {
      try {
        const params = JSON.parse(body);
        const payload = {
          url: params.imageUrl,
          prompt: ["DESCRIPTION", "RATE", "HOURS", "AMOUNT"], // streamline to the data you need.
        };

        // Await the response from the vision API and wrap in a try-catch
        const data = await jigsawstack.vision.vocr(payload);

        console.log(data);

        // Send a successful response
        response.writeHead(200, { "Content-Type": "application/json" });
        response.end(JSON.stringify({ message: "ID verification successful", data }));
      } catch (apiError) {
        // Handle the error from the API call
        console.error(apiError);
        response.writeHead(500, { "Content-Type": "application/json" });
        response.end(JSON.stringify({ message: "API Error", error: apiError.toString() }));
      }
    });
  } catch (error) {
    console.error(error);
    response.writeHead(500, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ message: "Internal Server Error" }));
  }
};


// Create the HTTP server
const server = http.createServer((req, res) => {
  if (req.method === "POST" && req.url === "/") {
    POST(req, res);
  } else {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Not Found" }));
  }
});

// Start the server
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

