export class AppConfig {
  public static get HumpbackAPI(): string {
    return "";
  }

  public static get EventName(): any {
    return {
      "UserInfoChanged": "userinfo.changed",
      "GroupInfoChanged": "groupinfo.changed",
      "SidebarMini": "sidebar.stateChaged"
    }
  }

  public static get PrivateRegistryAddress(): string {
    return 'http://192.168.172.45';
  }

  public static DockerAPIFormatter(ip: string): string {
    return `http://${ip}:8500/v1`;
  }
}