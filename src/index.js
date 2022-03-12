import moment from 'moment';
import SteamTotp from 'steam-totp';
import SteamUser from 'steam-user';

import log from './components/log.js';
import removeFriends from './components/removeFriends.js';
import { client, community, manager } from './components/steamClient.js';
import main from './config/main.js';

client.logOn({
  accountName: main.userName,
  password: main.passWord,
  twoFactorCode: SteamTotp.getAuthCode(main.sharedSecret),
  identity_secret: main.identitySecret,
  rememberPassword: true,
  shared_secret: main.sharedSecret,
});

client.on('loggedOn', () => {
  client.setPersona(SteamUser.EPersonaState.Online);
});

client.on('webSession', async (value, cookies) => {
  manager.setCookies(cookies, (error) => {
    if (error) {
      log.error('An error occurred while setting cookies.');
    } else {
      log.info('Websession created and cookies set.');
    }
  });

  community.setCookies(cookies);
  community.startConfirmationChecker(
    moment.duration(20, 'seconds'),
    main.identitySecret
  );

  await removeFriends();
});

client.on('error', (error) => {
  const minutes = 25;
  const seconds = 5;

  switch (error.eresult) {
    case SteamUser.EResult.AccountDisabled:
      log.error(`This account is disabled!`);
      break;
    case SteamUser.EResult.InvalidPassword:
      log.error(`Invalid Password detected!`);
      break;
    case SteamUser.EResult.RateLimitExceeded:
      log.warn(
        `Rate Limit Exceeded, trying to login again in ${minutes} minutes.`
      );
      setTimeout(() => {
        client.relog();
      }, moment.duration(minutes, 'minutes'));
      break;
    case SteamUser.EResult.LogonSessionReplaced:
      log.warn(
        `Unexpected Disconnection!, you have LoggedIn with this same account in another place. Trying to login again in ${seconds} seconds.`
      );
      setTimeout(() => {
        client.relog();
      }, moment.duration(seconds, 'seconds'));
      break;
    default:
      log.warn(
        `Unexpected Disconnection!, trying to login again in ${seconds} seconds.`
      );
      setTimeout(() => {
        client.relog();
      }, moment.duration(seconds, 'seconds'));
      break;
  }
});

client.on('friendRelationship', (sender, rel) => {
  if (rel === 0) {
    log.info(
      `User ID: ${sender.getSteamID64()} has deleted from their friendlist.`
    );
  }
});

client.on('emailInfo', (address) => {
  log.info(`E-Mail: ${address}`);
});

client.on(
  'accountLimitations',
  (limited, communityBanned, locked, canInviteFriends) => {
    if (limited) {
      log.info(
        'Account is limited. Cannot send friend invites, use the market, open group chat, or access the web API.'
      );
      client.logOff();
    }
    if (communityBanned) {
      log.info('Account is banned from Steam Community');
      client.logOff();
    }
    if (locked) {
      log.info(
        'Account is locked. We cannot trade/gift/purchase items, play on VAC servers, or access Steam Community.  Shutting down.'
      );
      client.logOff();
      // eslint-disable-next-line no-process-exit
      process.exit(1);
    }
    if (!canInviteFriends) {
      log.info('Account is unable to send friend requests.');
      client.logOff();
    }
  }
);
