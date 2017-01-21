export class AppConfig {
  public static get EventName(): any {
    return {
      "UserInfoChanged": "userinfo.changed",
      "GroupInfoChanged": "groupinfo.changed",
      "SidebarMini": "sidebar.stateChaged"
    }
  }

  public static DockerAPIFormatter(ip: string): string {
    return `http://${ip}:8500/v1`;
  }
}