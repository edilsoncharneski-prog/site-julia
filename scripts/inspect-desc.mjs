import puppeteer from 'puppeteer-core';

const browser = await puppeteer.launch({
  executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});

const page = await browser.newPage();
await page.goto('https://www.soollar.com.br/cd/cdcuiabamt/produto/022a27cd-fc3a-4d96-a882-253920ba9a50', {
  waitUntil: 'networkidle2',
  timeout: 30000,
});

const data = await page.evaluate(() => {
  const links = Array.from(document.querySelectorAll('a')).map((a) => ({
    href: a.href,
    title: a.title,
    aria: a.getAttribute('aria-label'),
    imgAlt: a.querySelector('img')?.alt,
    imgSrc: a.querySelector('img')?.src,
    parentText: a.parentElement?.innerText,
  }));
  return links.filter((l) => l.href.includes('drive.google.com'));
});

console.log('DRIVE LINKS WITH METADATA:', JSON.stringify(data, null, 2));

// Test what each drive link points to
for (const item of data) {
  try {
    const res = await fetch(item.href, { method: 'HEAD', redirect: 'follow' });
    console.log(item.href, '-> status:', res.status, 'url:', res.url);
  } catch (err) {
    console.log(item.href, '-> err:', err.message);
  }
}

await browser.close();
