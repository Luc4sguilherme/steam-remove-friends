import log from './log.js';
import { client } from './steamClient.js';
import { delay } from './utils.js';

export default async () => {
  const friends = client.myFriends;

  for (let i = 0; i <= Object.keys(friends).length; i += 1) {
    try {
      const stateOfFriend = Object.values(friends)[i];
      const friend = Object.keys(friends)[i];

      if (stateOfFriend === 3 || stateOfFriend === 4) {
        client.removeFriend(friend);
        await delay(500);
      }
    } catch (error) {
      log.error(error);
    }
  }

  log.info('Finished');
};
