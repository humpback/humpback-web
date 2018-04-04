export interface IContainer {
  Name: string;
  Image: string;
  Command: string;
  HostName: string;
  NetworkMode: string;
  RestartPolicy: string;
  RestartRetryCount: number;
  Ports: IPortBinding[];
  Volumes: IVolumeBinding[];
  Env: IEnvironment[];
  Dns: string[];
  Links: ILink[];
  LogConfig: any;
  CPUShares: any;
  Memory: any;
}

export interface IPortBinding {
  PrivatePort: number;
  PublicPort: number;
  Type: string;
}

export interface LogConfig {
  Type: string;
  Config: any;
}

export interface IVolumeBinding {
  ContainerVolume: string;
  HostVolume: string;
}

export interface IEnvironment {
  Value: string;
}

export interface ILink {
  Value: string;
}
