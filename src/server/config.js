let getConfig = () => {
  let env = process.env.HUMPBACK_ENV || 'gdev';
  let configInfo = {
    version: '1.0.0',
    isDebugMode: true,
    listenPort: process.env.HUMPBACK_LISTEN_PORT || 80,    
    groupCollection: 'GroupInfo',
    imageCollection: 'ImageInfo',
    userCollection: 'UserInfo',
    logCollection: 'LogInfo',
    sessionCollection: 'SessionInfo',
    encryptKey: 'humpback@123'
  };
  return configInfo;
}

module.exports = getConfig();