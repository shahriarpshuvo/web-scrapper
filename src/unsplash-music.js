const { downloadFile } = require('../utils/file-download');
const puppeteer = require('puppeteer');
const fs = require('fs');
const { setTimeout } = require('timers/promises');

const BASE_URL = 'https://pixabay.com/music/search/?order=ec&duration=240-480';
const DOWNLOAD_DIR = './resources/unsplash-music';
const DOWNLOAD_DIR_EXISTS = fs.existsSync(DOWNLOAD_DIR);
const PLAY_BUTTON_SELECTOR = 'button[aria-label="Play"]';
const MUSIC_THUMBNAIL_SELECTOR = '.track-item img';
const MUSIC_NAME_SELECTOR = '.track-item .track-title';
const MUSIC_AUTHOR_SELECTOR = '.track-item .track-author';
const MUSIC_DURATION_SELECTOR = '.track-item .track-duration';
const MUSIC_GENRE_SELECTOR = '.track-item .track-genre';

async function downloadMusic() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  try {
    await page.goto(BASE_URL);

    // Wait for the song list to load
    // await page.waitForSelector('.track-list');

    await setTimeout(6000);

    const playButtons = await page.$$('button[aria-label="Play"]');

    if (playButtons.length === 0) {
      throw new Error('No play buttons found');
    }

    for (let i = 0; i < playButtons.length; i++) {
      await page.evaluate(() => {
        const audioElement = document.querySelector('audio');
        if (audioElement) {
          audioElement.pause();
          audioElement.remove();
        }
      });

      await playButtons[i].click();
      await setTimeout(10000);

      const audioURL = await page.evaluate(() => {
        const audioElement = document.querySelector('audio');
        return audioElement?.src;
      });

      if (audioURL) {
        const fileName = `${DOWNLOAD_DIR}/${i}/downloaded_song.mp3`;
        downloadFile(audioURL, fileName);
      }

      const thumbnailURL = await page.evaluate(() => {
        const thumbnailElement = document.querySelector('.track-item img');
        return thumbnailElement?.src;
      });

      if (thumbnailURL) {
        const fileName = `downloaded_song_${i}.mp3`;
        downloadFile(audioURL, fileName);
      }
    }
  } catch (error) {
    console.error('Error occurred:', error);
  } finally {
    await browser.close();
  }
}

exports.downloadMusic = downloadMusic;
