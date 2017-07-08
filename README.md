# Introduction

作为 [Humpback](https://humpback.github.io/humpback) 的直观展现，基于 [Angular2](https://github.com/angular/angular) 和 [AdminLTE](https://github.com/almasaeed2010/AdminLTE) 构建的用于管理 `docker ` 的网站。

# Usage
```bash
git clone https://github.com/humpback/humpback-web.git
cd humpback-web
npm install
npm start
```
Open [http://localhost](http://localhost)

Default Account    
>UserID: `admin`   
Password: `123456`    

# Docker image
[![](https://images.microbadger.com/badges/image/humpbacks/humpback-web:1.0.1.svg)](https://microbadger.com/images/humpbacks/humpback-web:1.0.1 "Get your own image badge on microbadger.com")
[![](https://images.microbadger.com/badges/version/humpbacks/humpback-web:1.0.1.svg)](https://microbadger.com/images/humpbacks/humpback-web:1.0.1 "Get your own version badge on microbadger.com")
```bash
$ docker pull humpbacks/humpback-web:1.0.1

$ docker run -d --net=host --restart=always -e HUMPBACK_LISTEN_PORT=8012 \
  -v /opt/app/humpback-web/dbFiles:/humpback-web/dbFiles \
  --name humpback-web \
  humpbacks/humpback-web:1.0.1
```

# Functions
- 服务器分组管理
- 容器及镜像管理
- 容器批量操作
- 容器实时监控
- 容器日志查看
- 私有仓库管理
- etc.

# Sample Page
#### Login Page
![image](https://cloud.githubusercontent.com/assets/9428909/22197325/73c2aba4-e18c-11e6-9c9a-c00318abf6f5.png)

#### Server Overview
![image](https://cloud.githubusercontent.com/assets/9428909/22238288/9fc10bc8-e24b-11e6-840a-87699929063f.png)

#### New Container
![image](https://cloud.githubusercontent.com/assets/9428909/22238315/b8292790-e24b-11e6-84ba-58e97288a104.png)

#### Private registry explore - docker image detail
![image](https://cloud.githubusercontent.com/assets/9428909/22238333/ca0debee-e24b-11e6-871b-a1134ed8af46.png)
etc.

## License

Apache-2.0
