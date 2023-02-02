import ProgressBar from 'cli-progress';
import _ from 'lodash';
import SteamUser from 'steam-user';

import main from '../config/main.js';
import getUser from './getUser.js';
import log from './log.js';
import { client } from './steamClient.js';

const progressBar = new ProgressBar.Bar({
  format: 'Removing friends [{bar}] {percentage}% ',
  barCompleteChar: '\u2588',
  barIncompleteChar: '\u2591',
  hideCursor: true,
  clearOnComplete: true,
  emptyOnZero: true,
});

export default async () => {
  try {
    const friends = Object.entries(client.myFriends);
    let friendsRemoved = 0;

    progressBar.start(friends.length, 0);

    const task = async ([friend, state]) => {
      if (state === SteamUser.EFriendRelationship.Friend) {
        const profile = await getUser(friend);

        if (
          (main.filters.tradeBan && profile.tradeBanState !== 'None') ||
          (main.filters.vacBan && profile.vacBanned) ||
          (main.filters.limitedAccount && profile.isLimitedAccount) ||
          profile.level <= main.filters.steamLevel ||
          profile.lastTimeOnline >= main.filters.inactiveDays
        ) {
          client.removeFriend(friend);
          friendsRemoved += 1;
        }

        progressBar.increment();
      }
    };

    for (const chunk of _.chunk(friends, 100)) {
      await Promise.allSettled(chunk.map(task));
    }

    progressBar.stop();

    log.info(
      `Operation performed successfully: ${friendsRemoved} users removed.`
    );
  } catch (error) {
    console.clear();
    log.error(error);
  }
};
