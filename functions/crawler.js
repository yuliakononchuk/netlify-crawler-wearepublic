
const chrome = require('chrome-aws-lambda');
const fs = require('fs');

exports.handler = async (event, context) => {
  
  await getEvents();
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "Fetching completed!",
      buffer: screenshot
    })
  }
}


const getEvents = async () => {
  console.warn('headless: ', chrome.headless);
  const executablePath = chrome.headless ? await chrome.executablePath : "./node_modules/puppeteer/.local-chromium/win64-706915/chrome-win/chrome.exe"
  console.warn("executablePath", executablePath)

  const browser = await chrome.puppeteer.launch({
    args: chrome.args,
    executablePath,
    defaultViewport: chrome.defaultViewport,
    headless: chrome.headless
  });
  console.warn('browser started')

  const page = await browser.newPage()
  try {
    await page.goto('https://www.wearepublic.nl/programma/?region=amsterdam-stad&region=haarlem&region=noord-holland&region=den-haag&region=delft&region=leiden&region=zuid-holland&genre=false&search=')
    console.warn('goto succeded')
  } catch (e) {
    console.log('GO TO Error:', e);
  }
  await page.waitFor(5000);
  let prevLastElement = null;
  let currentLastElement = await page.evaluate(getLastElement);

  while (currentLastElement !== prevLastElement) {
    await page.evaluate(scrollPageDown);
    await page.waitFor(5000);
    prevLastElement = currentLastElement;
    currentLastElement = await page.evaluate(getLastElement);
  }

  const links = await page.evaluate(() => {
    const headers = document.querySelectorAll('.event-item__header .event-item__date');
    return Array.from(headers).map(item => item.getAttribute("href"))
  })

  const eventsData = await Promise.all(links.map(async link => {
    return await getData(link)
  }));

  const json = JSON.stringify({ data: eventsData });
  fs.writeFileSync('./data.json', json)

  await browser.close();

  function getLastElement() {
    const all = document.querySelectorAll('.event-item__header .event-item__date');
    return all[all.length - 1].getAttribute("href");
  }

  function scrollPageDown() {
    document.querySelector('.footer--membership').scrollIntoView()
  }

  async function getData(url) {
    const page = await browser.newPage()
    page.setDefaultTimeout(0)
    try {
      await page.goto(url)
    } catch (e) {
      console.log('GO TO Error - Event pages:', e);
    }
    const data = await page.evaluate(url => ({
      url: url,
      name: document.querySelector('.section__title').innerText,
      date: document.querySelector('.event-meta__date').innerText,
      location: document.querySelector('.event-meta__info li:nth-child(2)').innerText,
      likes: document.querySelector('.fav__counter').innerText,
      more_info: document.querySelector('.section__cta a').getAttribute("href")
    }), url).catch(e => console.error(e));
    return data;
  }
};