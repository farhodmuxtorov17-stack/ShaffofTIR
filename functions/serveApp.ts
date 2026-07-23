Deno.serve(async (req) => {
  const url = new URL(req.url);
  const path = url.pathname;

  // Serve JS bundle
  if (path.endsWith('/app.js')) {
    const jsResponse = await fetch('https://media.base44.com/files/public/6a60a1285fdfa20b7d19fd22/d041b1b51_app.js');
    const jsCode = await jsResponse.text();
    return new Response(jsCode, {
      status: 200,
      headers: {
        'Content-Type': 'application/javascript; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
      }
    });
  }

  // Serve HTML with external script src (avoids CSP inline restriction)
  const baseUrl = `${url.protocol}//${url.host}${url.pathname.replace(/\/$/, '')}`;
  const html = `<!DOCTYPE html>
<html lang="uz">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="Content-Security-Policy" content="default-src 'self' https: data: blob: 'unsafe-inline' 'unsafe-eval'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; style-src 'self' 'unsafe-inline' https:; font-src 'self' https: data:; img-src 'self' https: data: blob:; connect-src 'self' https:;">
<title>ShaffofTIR</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;450;500;600;700&display=swap" rel="stylesheet">
</head>
<body>
<div id="app"></div>
<script src="${baseUrl}/app.js"></script>
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Security-Policy': "default-src 'self' https: data: blob: 'unsafe-inline' 'unsafe-eval'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; style-src 'self' 'unsafe-inline' https:; font-src 'self' https: data:; img-src 'self' https: data: blob:; connect-src 'self' https:;",
    }
  });
});
