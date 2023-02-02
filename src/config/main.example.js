export default {
  userName: '',

  passWord: '',

  sharedSecret: '',

  identitySecret: '',

  filters: {
    tradeBan: true,
    vacBan: true,
    limitedAccount: true,
    inactiveDays: 365,
    steamLevel: 0, // remove users with low level
  },
};
