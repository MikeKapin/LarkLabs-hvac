// Netlify Function to proxy Claude API requests
// This keeps the API key secure on the server side

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  // Get the API key from environment variables
  const CLAUDE_API_KEY = process.env.ANTHROPIC_API_KEY;

  if (!CLAUDE_API_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'API key not configured' })
    };
  }

  try {
    // Parse the request body
    const { question, sessionTitle, sessionDescription, topics } = JSON.parse(event.body);

    // Call the Anthropic API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: [{
          role: 'user',
          content: `You are an AI teaching assistant for a professional development course called "College Educators & AI Tools" by LARK Labs.

Current Session: ${sessionTitle}
Session Description: ${sessionDescription}
Topics Covered: ${topics}

Student Question: ${question}

Please provide a helpful, educational response that directly addresses the question in the context of this session. Be concise, practical, and encouraging.`
        }]
      })
    });

    const data = await response.json();

    // Return the AI response
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: JSON.stringify({
        answer: data.content[0].text
      })
    };

  } catch (error) {
    console.error('Claude API Error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        error: 'Failed to get AI response',
        details: error.message
      })
    };
  }
};
