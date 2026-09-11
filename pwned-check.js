#!/usr/bin/env node
// pwned-check — vérifie si un mot de passe apparaît dans des fuites de données
// via l'API Have I Been Pwned (modèle k-anonymity : le mot de passe ne quitte
// jamais la machine, seuls les 5 premiers caractères du hash SHA-1 sont envoyés).

const crypto = require("crypto");
const readline = require("readline");

const API = "https://api.pwnedpasswords.com/range/";

async function checkPassword(password) {
  const sha1 = crypto.createHash("sha1").update(password).digest("hex").toUpperCase();
  const prefix = sha1.slice(0, 5);
  const suffix = sha1.slice(5);

  const res = await fetch(API + prefix, {
    headers: { "Add-Padding": "true", "User-Agent": "pwned-check-cli" },
  });
  if (!res.ok) throw new Error(`API HIBP : HTTP ${res.status}`);

  const body = await res.text();
  for (const line of body.split("\n")) {
    const [hashSuffix, count] = line.trim().split(":");
    if (hashSuffix === suffix) return parseInt(count, 10);
  }
  return 0;
}

function promptHidden(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    // Masque la saisie : on réécrit la question sans afficher les caractères tapés
    const onData = (char) => {
      if (!["\n", "\r", ""].includes(char.toString())) {
        readline.cursorTo(process.stdout, question.length);
        readline.clearLine(process.stdout, 1);
      }
    };
    process.stdin.on("data", onData);
    rl.question(question, (answer) => {
      process.stdin.removeListener("data", onData);
      rl.close();
      process.stdout.write("\n");
      resolve(answer);
    });
  });
}

async function main() {
  const arg = process.argv[2];

  if (arg === "--help" || arg === "-h") {
    console.log(`Usage :
  pwned-check              saisie masquée (recommandé)
  pwned-check <motdepasse> vérification directe (visible dans l'historique shell !)
  pwned-check --help       affiche cette aide`);
    return;
  }

  const password = arg ?? (await promptHidden("Mot de passe à vérifier : "));
  if (!password) {
    console.error("Aucun mot de passe fourni.");
    process.exitCode = 1;
    return;
  }

  try {
    const count = await checkPassword(password);
    if (count > 0) {
      console.log(`COMPROMIS : ce mot de passe apparaît ${count.toLocaleString("fr-FR")} fois dans des fuites connues.`);
      console.log("Ne l'utilisez pas. Changez-le partout où il est en service.");
      process.exitCode = 2;
    } else {
      console.log("Aucune trace dans les fuites connues de HIBP.");
      console.log("(Ça ne garantit pas qu'il soit fort, utilisez un gestionnaire de mots de passe.)");
    }
  } catch (err) {
    console.error(`Erreur : ${err.message}`);
    process.exitCode = 1;
  }
}

main();
