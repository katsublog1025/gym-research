const fs = require('fs');

// Read the data.js file
const code = fs.readFileSync('c:/Users/nftbl/product/kyougou/data.js', 'utf-8');

// Use regex to extract all unique URLs
const urlRegex = /url:\s*"(https?:\/\/[^"]+)"/g;
const urls = [];
let match;

while ((match = urlRegex.exec(code)) !== null) {
    if (!urls.includes(match[1])) {
        urls.push(match[1]);
    }
}

console.log(`Found ${urls.length} unique URLs to check.`);

async function checkUrls() {
    for (const url of urls) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);
            
            const response = await fetch(url, { 
                method: 'GET',
                signal: controller.signal,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });
            clearTimeout(timeoutId);
            
            if (response.ok) {
                console.log(`[OK] ${url}`);
            } else {
                console.log(`[WARN] ${url} - Status: ${response.status}`);
            }
        } catch (error) {
            console.log(`[ERROR] ${url} - ${error.message}`);
        }
        // Small delay to prevent rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    console.log("Check complete.");
}

checkUrls();
