var fs = require("fs");
var ejs = require("ejs");
var path = require("path");
var https = require("https");
var request = require("request");

var httpGetLatest = function(callback){
    request({
        url: "https://api.github.com/repos/rebaslight/rebaslight/releases/latest",
        json: true,
        headers: {
            "User-Agent": "request"
        }
    }, function(err, resp, body){
        if(err)
            return callback(err);
        if(resp.statusCode !== 200)
            return callback(new Error("Got a statusCode=" + resp.statusCode + " for: " + url));
        callback(null, body);
    });
};

var btn_src = "";
btn_src += "<p>";
btn_src += "<a href=\"<%= url %>\" class=\"btn btn-primary\">";
btn_src += "<i class=\"fa fa-download\"></i> Download <%= label %>";
btn_src += "</a>";
btn_src += "</p>";
var btnTemplate = ejs.compile(btn_src);

httpGetLatest(function(err, data){
    if(err) throw err;
    var info = {
        version: data.tag_name,
        btns_by_os: {
            win: [],
            mac: [],
            linux: [],
        }
    };
    data.assets.forEach(function(a){
        var url = a.browser_download_url;
        var push = function(os, label){
            info.btns_by_os[os].push(btnTemplate({
                label: label,
                url: url
            }));
        };

        if(/\.exe$/i.test(url)){
            return push("win", ".exe");
        }
        if(/\.dmg$/i.test(url)){
            return push("mac", ".dmg");
        }
        if(/\.AppImage$/i.test(url)){
            return push("linux", ".AppImage");
        }
        if(/\.deb$/i.test(url)){
            return push("linux", ".deb");
        }
        if(/\.tar\.xz$/i.test(url)){
            return push("linux", ".tar.xz");
        }
    });

    var src = fs.readFileSync(path.resolve(__dirname, "./index.ejs"), "utf8");
    var html = ejs.render(src, info, {});
    fs.writeFileSync(path.resolve(__dirname, "./index.html"), html);
});

