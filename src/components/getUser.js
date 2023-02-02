import * as cheerio from 'cheerio';
import SteamID from 'steamid';

import { community, client } from './steamClient.js';

async function getLevel(id) {
  return new Promise((resolve, reject) => {
    client.getSteamLevels([id], (error, user) => {
      if (error) {
        reject(error);
      } else {
        resolve(Object.values(user));
      }
    });
  });
}

async function getLastTimeOnline(id) {
  return new Promise((resolve, reject) => {
    community.httpRequestGet(
      {
        uri: `https://steamcommunity.com/profiles/${id}`,
      },
      (err, _response, body) => {
        if (err) {
          reject(new Error(err));
        }

        const $ = cheerio.load(body);

        const inGame = Boolean(
          $('.profile_in_game_header')
            .text()
            .match(/Currently In-Game|In non-Steam game/)
        );

        if (inGame) {
          resolve(0);
        }

        const currentlyOnline = $('.profile_in_game_header')
          .text()
          .includes('Currently Online');

        if (currentlyOnline) {
          resolve(0);
        }

        const lastTimeOnline = $('.profile_in_game_name')
          .text()
          .match(/Last Online (?<days>\d+) days ago/)?.groups;

        const days = Number(lastTimeOnline?.days || 0);

        resolve(days);
      }
    );
  });
}

async function getProfile(id) {
  return new Promise((resolve, reject) => {
    community.getSteamUser(new SteamID(id), (error, user) => {
      if (error) {
        reject(error);
      } else {
        resolve(user);
      }
    });
  });
}

export default async (id) => {
  const [profile, lastTimeOnline, level] = await Promise.all([
    getProfile(id),
    getLastTimeOnline(id),
    getLevel(id),
  ]);

  return {
    ...profile,
    lastTimeOnline,
    level,
  };
};
