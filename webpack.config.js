module.exports = [{
    entry: ["./build/test/index.js"],
    output: {
        path: __dirname + "/build",
        filename: "tests.js"
    },
    module: {
        loaders: [
        ]
    },
    node: {
        fs: "empty"
    }
}, {
    entry: ["./build/test/subscription-reliability.js"],
    output: {
        path: __dirname + "/build/",
        filename: "subscription-test.js"
    },
    node: {
        fs: "empty"
    }
}];