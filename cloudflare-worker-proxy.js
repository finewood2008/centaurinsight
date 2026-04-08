export default {
  async fetch(request, env) {
    // 1. 处理 CORS 跨域请求（让浏览器允许访问）
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        }
      });
    }

    if (request.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    // 2. 在这里填入你的 Google Gemini API Key（放在这里最安全，前端看不到）
    const API_KEY = "AIzaSyBZwVeKQu21DqYUzr5UTmVa8R0RhAez2iI";
    
    // 3. 构建发往 Google 官方服务器的请求
    const googleUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${API_KEY}`;
    
    const originalBody = await request.text();

    try {
      // 4. Cloudflare 服务器（在海外）代为向 Google 发起请求
      const response = await fetch(googleUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: originalBody
      });

      const data = await response.text();

      // 5. 将 Google 的结果加上允许跨域的 Header，返回给国内的 H5 前端
      return new Response(data, {
        status: response.status,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json"
        }
      });

    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json"
        }
      });
    }
  }
};