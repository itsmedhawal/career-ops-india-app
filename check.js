const fs = require("fs");
const h = fs.readFileSync("index-v8.html", "utf8");
const sm = h.match(/<script[\s\S]*?<\/script>/g) || [];
let js = "";
sm.forEach(function(s) {
  js += s.replace(/<script[^>]*>/, "").replace(/<\/script>/, "") + "\n";
});

// Syntax check
try { new Function(js); console.log("Syntax: OK"); }
catch(e) { console.log("Syntax ERROR:", e.message); }

// Brace depth — strip string/template literals
let stripped = "";
let i = 0;
while (i < js.length) {
  if (js[i] === "`") {
    i++;
    while (i < js.length && js[i] !== "`") { stripped += " "; i++; }
    stripped += " "; i++;
  } else if (js[i] === "'" || js[i] === '"') {
    const q = js[i];
    stripped += " "; i++;
    while (i < js.length && js[i] !== q) {
      if (js[i] === "\\") { stripped += "  "; i += 2; }
      else { stripped += " "; i++; }
    }
    stripped += " "; i++;
  } else {
    stripped += js[i]; i++;
  }
}

let depth = 0;
for (let c of stripped) {
  if (c === "{") depth++;
  else if (c === "}") depth--;
}
console.log("Brace depth (strings stripped):", depth);
