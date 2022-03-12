import moment from 'moment';
import TradeOfferManager from 'steam-tradeoffer-manager';
import SteamUser from 'steam-user';
import SteamCommunity from 'steamcommunity';

export const client = new SteamUser();
export const community = new SteamCommunity();
export const manager = new TradeOfferManager({
  steam: client,
  community,
  language: 'en',
  pollInterval: moment.duration(1, 'seconds'),
  cancelTime: moment.duration(1, 'hours'),
  savePollData: true,
});
