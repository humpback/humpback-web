let getConfig = () => {
  let configInfo = {
    version: '1.0.0',
    isDebugMode: true,
    listenPort: process.env.HUMPBACK_LISTEN_PORT || 8100,
    dbConfigs: {
      groupCollection: { name: 'GroupInfo' },
      imageCollection: { name: 'ImageInfo' },
      userCollection: { name: 'UserInfo' },
      logCollection: { name: 'LogInfo', ttl: 30 * 24 * 60 * 60 },
      sessionCollection: { name: 'SessionInfo', ignoreLoad: true },
      systemConfigCollection: { name: 'SystemConfig' },
      dashboardCollection: { name: 'Dashboard' }
    },
    encryptKey: 'humpback@123'
  };
  return configInfo;
};

module.exports = getConfig();
