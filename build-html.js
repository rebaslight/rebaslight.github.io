var fs = require("fs");
var ejs = require("ejs");
var path = require("path");
var https = require("https");

var httpGetLatest = function (callback) {
  const url =
    "https://api.github.com/repos/rebaslight/rebaslight/releases/latest";
  https
    .get(url, { headers: { "User-Agent": "request" } }, (res) => {
      if (res.statusCode !== 200) {
        return callback(
          new Error("Got a statusCode=" + res.statusCode + " for: " + url)
        );
      }
      let body = "";
      res.on("data", (chunk) => {
        body += chunk;
      });
      res.on("end", () => {
        try {
          let json = JSON.parse(body);
          callback(null, json);
        } catch (error) {
          callback(error);
        }
      });
    })
    .on("error", (error) => {
      callback(error);
    });
};

var btn_src = "";
btn_src += "<p>";
btn_src += "<a href=\"<%= url %>\" class=\"btn btn-primary\" onClick=\"ga('send','event','goal','click','download',1)\">";
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
            info.btns_by_os[os].push({
                label: label,
                url: url
            });
        };

        if(/\.exe$/i.test(url)){
            return push("win", ".exe");
        }
        if(/\.dmg$/i.test(url)){
            return push("mac", ".dmg");
        }
        if(/amd64\.deb$/i.test(url)){
            return push("linux", ".deb (64)");
        }
        if(/i386\.deb$/i.test(url)){
            return push("linux", ".deb (32)");
        }
        if(/ia32\.tar\.bz2$/i.test(url)){
            return push("linux", ".tar.bz2 (32)");
        }
        if(/\.tar\.bz2$/i.test(url)){
            return push("linux", ".tar.bz2 (64)");
        }
    });

    var linuxDLSortScore = function(a){
        var score = 0;
        if(/tar/.test(a.label)){
            score += 20;
        }else if(/deb/.test(a.label)){
            score += 10;
        }
        if(/64/.test(a.label)){
            score += 1;
        }
        return score;
    };

    info.btns_by_os["linux"].sort(function(a, b){
        return linuxDLSortScore(b) - linuxDLSortScore(a);
    });

    Object.keys(info.btns_by_os).forEach(function(os){
        info.btns_by_os[os] = info.btns_by_os[os].map(btnTemplate);
    });

    var src = fs.readFileSync(path.resolve(__dirname, "./index.ejs"), "utf8");
    var html = ejs.render(src, info, {});
    fs.writeFileSync(path.resolve(__dirname, "./index.html"), html);
    fs.writeFileSync(path.resolve(__dirname, "./latest.json"), JSON.stringify({
        version: info.version.replace(/^v/, "").trim()
    }));
});

