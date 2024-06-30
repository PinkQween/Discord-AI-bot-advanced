const puppeteer = require('puppeteer');
const { colabURI, automatic1111 } = require('../env')
const axios = require('axios');

const runGoogleColab = async () => {
    const browser = await puppeteer.launch({ headless: true }); // Launch browser in non-headless mode for visibility
    const page = await browser.newPage();

    // Navigate to the Google Colab notebook
    await page.goto(colabURI, { waitUntil: 'networkidle0' });

    // Wait for the page to load
    await page.waitForSelector('colab-run-button');

    // Click on "Run all" button (assuming the button has the class 'colab-run-button')
    await page.click('colab-run-button');

    // Wait for the execution to finish (adjust the timeout as needed)
    await page.waitForTimeout(500000);

    // await browser.close();
}


const checkAIStatus = async (url = automatic1111) => {
    try {
        const response = await axios.get(url);
        // Check if status code is 404
        if (response.status === 404) {
            console.log(`Website ${url} returned a 404 error.`);

            runGoogleColab().catch(error => console.error(error));
        } else {
            console.log(`Website ${url} is up and running.`);
        }
    } catch (error) {
        // console.error(`Error accessing ${url}: ${error.message}`);
        // Handle other errors as needed
    }
}

module.exports = checkAIStatus;