# Auto-Bencher
![Test](https://github.com/elasql/auto-bencher/actions/workflows/github_actions.yml/badge.svg)

## Prerequisite
The node version should be greater than 12.16.1.

We suggest users use [nvm (node version manager)](https://github.com/nvm-sh/nvm) to manage and switch among the different node version. It would be stable to use LTS.

## Usage

- Clone AutoBench
    ```sh
    git clone https://github.com/elasql/auto-bencher.git
    ```

- Check into the directory
    ```sh
    `cd auto-bencher`
    ```

- Install the dependencies
    ```sh
    npm install
    ```
    npm is a package manager of nodeJS.

- To see how to run
    ```sh
    node src/main.js -h
    ```

## Actions
- Intialize and verify all machines
    ```sh
    node src/main.js [-c config.toml] init
    ```
    - `-c` is an optional field

- Execute the shell commands on all machines
    ```sh
    node src/main.js [-c config.toml] exec --command [CMD]
    ```
    - `-c` is an optional field

- Load data on all machines
    ```sh
    node src/main.js [-c config.toml] load --parameter [parameter file] -d [db name]
    ```
    - `--properties` is an optional field

- Benchmark the DBMS
    ```sh
    node src/main.js [-c config.toml] benchmark --parameter [parameter file] -d [db name]
    ```
    - `--properties` is an optional field

- Grab the data according to the search pattern
    ```sh
    node src/main.js [-c config.toml] pull --pattern [search pattern]
    ```
    - `-c` is an optional field

## Debug
To run authbencher in debug mode, please add `--debug` before the main action.

For example
```sh
node src/main.js -c config.toml [--debug] benchmark --parameter [parameter file] -d [db name]
```

## How to contribute this project
1. Create a pull request and state the fixed issues
    - it would be better to add some test cases
2. Pass eslint (formatting)
    ```sh
    npm run eslint
    ```
3. Pass unittests
    ```sh
    npm run test
    ```
