# Auto-bench

## installation

- 下載
`git clone https://github.com/elasql/autobench.git`

- 進入資料夾
`cd autobench`

- 安裝dependencies
`npm install`

- 確認運行方式
`node src/main.js -h`

## 功能
- `node src/main.js -c config.toml init`
    - 初始化與檢察環境
- `node src/main.js -c config.toml exec -c [CMD]`
    - 執行給定指令 `[CMD]`
- `node src/main.js -c config.toml load --parameter [parameter file] -d [db name] -j [jars dir] --properties [properties dir]`
    - 為給定數量的機器跑載入資料
- `node src/main.js -c config.toml benchmark --parameter [parameter file] -d [db name] -j [jars dir] --properties [properties dir] [-i]`
    - 用給定的參數跑 benchmarks
- `node src/main.js -c config.toml pull --pattern [search pattern]`
    - 用給定的pattern從remote抓資料

### 進版要求

- 通過eslint
`npm run eslint`

- 通過test cases
`npm run test`
