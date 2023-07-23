const puppeteer = require("puppeteer");

const { exec } = require("child_process");

const express = require('express');
const { spawn } = require('child_process');
const axios = require('axios');

const app = express();
const PORT = 3000;
const TIMEOUT_DURATION = 5000; // 5 seconds

const linkToDetect = 'https://kki-mir.azurewebsites.net/new-form';


app.get('/open-link', async (req, res) => {
  try {
    const linkToOpen = 'https://tinyurl.com/3cpdahv4';

    openInBrowser(linkToOpen);

    // Simulate a delay for the request
    await new Promise((resolve) => setTimeout(resolve, TIMEOUT_DURATION));

    const response = await axios.get(linkToOpen);
    const statusCode = response.status;

    if (statusCode === 200) {
      return res.status(200).json({ message: 'Link opened successfully!', statusCode });
    } else if (statusCode === 404) {
      return res.status(404).json({ message: 'Link not found!', statusCode });
    } else {
      return res.status(statusCode).json({ message: 'Unexpected status code', statusCode });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Error occurred while opening the link', error });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

function openInBrowser(link) {
    let command;
    if (process.platform === 'win32') {          //for Windows
      command = `start ${link}`;
    } else if (process.platform === 'darwin') {  //for Mac OS
      command = `open ${link}`;
    } else {
      command = `xdg-open ${link}`;    //Linux & other platforms
    }
  
    exec(command, async (error, stdout, stderr) => {
      if (error) {
        console.error(`Error opening link: ${error.message}`);
      }

    
      const isLinkDetected = await waitForLinkDetection(link);
      
    if (isLinkDetected) {
      console.log('Task Completed Successfully');
      process.exit(0); // End the server process
    }
    });
  }



async function waitForLinkDetection(link) {
    const browser = await puppeteer.launch({ headless: 'new' }); // Use headless: 'new' to opt-in to the new headless mode
    const page = await browser.newPage();
  
    while (true) {
      // Navigate to the page to check for the link
      await page.goto(link, { waitUntil: 'domcontentloaded' });
  
      // Check if the specified link is present in the page content
      const isLinkDetected = await page.evaluate((link) => {
        return document.body.innerText.includes(link);
      }, link);
  
      if (isLinkDetected) {
        await browser.close();
        return true; // Exit the loop and indicate the link is detected
      }
      // Wait for a short interval before checking again
    await new Promise((resolve) => setTimeout(resolve, 1000));
}
}