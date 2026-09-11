# pwned-check

![Node.js 18+](https://img.shields.io/badge/Node.js-18%2B-339933?logo=nodedotjs&logoColor=white) ![Zéro dépendance](https://img.shields.io/badge/d%C3%A9pendances-aucune-2E7D32) ![Licence MIT](https://img.shields.io/badge/licence-MIT-546E7A)

**FR** — Outil en ligne de commande pour vérifier si un mot de passe apparaît dans des fuites de données connues, via l'API [Have I Been Pwned](https://haveibeenpwned.com/Passwords), sans jamais transmettre le mot de passe (modèle k-anonymity). Outil de sensibilisation à l'hygiène des identifiants, Node.js 18+, zéro dépendance.

**EN** — Command-line tool that checks whether a password appears in known data breaches through the [Have I Been Pwned](https://haveibeenpwned.com/Passwords) API, without ever transmitting the password (k-anonymity model). A credential-hygiene awareness tool, Node.js 18+, zero dependencies.

---

## Français

### Objectif

Illustrer concrètement un principe de sensibilisation : on peut vérifier qu'un mot de passe est compromis **sans jamais l'exposer**. L'outil sert aussi de brique de script, par exemple pour refuser un mot de passe connu des fuites lors d'une procédure interne.

### Contexte cybersécurité

Les mots de passe réutilisés ou présents dans des fuites publiques sont une des premières causes de compromission de comptes. Projet personnel écrit pour comprendre le modèle k-anonymity de HIBP en le réimplémentant, plutôt qu'en utilisant une bibliothèque existante :

1. Le mot de passe est hashé en SHA-1 localement.
2. Seuls les 5 premiers caractères du hash sont envoyés à l'API (`/range/<préfixe>`).
3. L'API renvoie tous les suffixes de hash commençant par ce préfixe (plusieurs centaines).
4. La comparaison finale se fait localement.

HIBP ne peut donc jamais savoir quel mot de passe a été testé, ni même s'il était compromis.

### Fonctionnalités

- Saisie masquée du mot de passe (rien à l'écran ni dans l'historique du shell).
- Vérification directe en argument, pour les scripts.
- Comparaison locale du condensat : le mot de passe ne quitte jamais la machine.
- En-tête `Add-Padding` activé : la réponse de l'API est complétée pour empêcher l'analyse par taille de réponse.
- Codes de sortie distincts pour « absent », « compromis » et « erreur ».

### Technologies et outils

- Node.js 18+ (`crypto`, `readline`, `fetch` natif)
- Aucune dépendance

Un seul fichier, `pwned-check.js` : `checkPassword()` (hachage, appel de l'API, comparaison locale), `promptHidden()` (saisie masquée via `readline`), `main()` (arguments, affichage, codes de sortie).

### Compatibilité

Fonctionne sous Windows, Linux et macOS avec Node.js 18 ou plus (https://nodejs.org, version LTS), sans aucun paquet à installer. La commande `node` est identique sur tous les systèmes.

| Système | Vérifier Node.js | Lancer l'outil |
|---|---|---|
| Windows (PowerShell) | `node --version` | `node pwned-check.js` |
| Linux (Debian, Ubuntu…) | `node --version` | `node pwned-check.js` |
| macOS | `node --version` | `node pwned-check.js` |

Sous PowerShell, écrire une commande longue sur une seule ligne (le `\` de continuation des exemples bash n'existe pas) ou utiliser l'accent grave `` ` `` en fin de ligne.

### Installation

```bash
git clone https://github.com/Lenu-san/pwned-check.git
cd pwned-check
node pwned-check.js --help
```

### Utilisation

```bash
# Saisie masquée (recommandé, rien dans l'historique du shell)
node pwned-check.js

# Vérification directe (le mot de passe apparaît dans l'historique du shell)
node pwned-check.js "monmotdepasse"
```

Codes de sortie : `0` absent des fuites connues, `1` erreur (réseau, saisie vide…), `2` compromis.

### Résultats

```
COMPROMIS : ce mot de passe apparaît 3 861 493 fois dans des fuites connues.
Ne l'utilisez pas. Changez-le partout où il est en service.
```

Sécurité : seul un préfixe de 5 caractères hexadécimaux (sur 40) sort de la machine, en HTTPS vers `api.pwnedpasswords.com`. Préférer la saisie masquée : un mot de passe passé en argument reste dans l'historique du shell et peut être visible dans la liste des processus.

### Limites

- **Ne mesure pas la robustesse** : un mot de passe absent des fuites peut rester faible. L'outil complète un gestionnaire de mots de passe, il ne le remplace pas.
- **Dépend de la disponibilité de l'API HIBP** ; sans réseau, l'outil renvoie une erreur (code `1`), pas un faux « non compromis ».
- **Un mot de passe à la fois** : pas de mode fichier ou lot.
- **SHA-1 uniquement**, format servi par l'API Pwned Passwords ; l'endpoint NTLM n'est pas implémenté.
- Le masquage de saisie est une réécriture de la ligne, pas un vrai mode terminal sans écho.
- Pas de tests automatisés.

### Améliorations possibles

- Mode lot depuis l'entrée standard (un mot de passe par ligne), avec sortie synthétique.
- Option `--quiet` pour n'utiliser que le code de sortie dans un script.
- Tests unitaires sur la fonction de comparaison, avec une réponse d'API simulée.

---

## English

### Objective

Give a concrete illustration of an awareness principle: a password can be checked for compromise **without ever being exposed**. The tool also works as a scripting building block, for instance to reject a breached password in an internal procedure.

### Cybersecurity context

Reused or publicly leaked passwords are one of the main causes of account compromise. A personal project written to understand HIBP's k-anonymity model by reimplementing it rather than using an existing library:

1. The password is hashed locally with SHA-1.
2. Only the first 5 characters of the hash are sent to the API (`/range/<prefix>`).
3. The API returns every hash suffix starting with that prefix (several hundred).
4. The final comparison happens locally.

HIBP can therefore never know which password was tested, nor whether it was compromised.

### Features

- Hidden password input (nothing on screen, nothing in the shell history).
- Direct check as an argument, for scripts.
- Local digest comparison: the password never leaves the machine.
- `Add-Padding` header enabled: the API response is padded to defeat response-size analysis.
- Distinct exit codes for “not found”, “compromised” and “error”.

### Technologies and tools

- Node.js 18+ (`crypto`, `readline`, native `fetch`)
- No dependency

A single file, `pwned-check.js`: `checkPassword()` (hashing, API call, local comparison), `promptHidden()` (hidden input through `readline`), `main()` (arguments, output, exit codes).

### Compatibility

Runs on Windows, Linux and macOS with Node.js 18 or later (https://nodejs.org, LTS release), nothing to install. The `node` command is the same on every system.

| System | Check Node.js | Run the tool |
|---|---|---|
| Windows (PowerShell) | `node --version` | `node pwned-check.js` |
| Linux (Debian, Ubuntu…) | `node --version` | `node pwned-check.js` |
| macOS | `node --version` | `node pwned-check.js` |

In PowerShell, write long commands on a single line (the bash `\` continuation does not exist) or end lines with a backtick `` ` ``.

### Installation

```bash
git clone https://github.com/Lenu-san/pwned-check.git
cd pwned-check
node pwned-check.js --help
```

### Usage

```bash
# Hidden input (recommended, nothing in the shell history)
node pwned-check.js

# Direct check (the password ends up in the shell history)
node pwned-check.js "mypassword"
```

Exit codes: `0` not found in known breaches, `1` error (network, empty input…), `2` compromised. Output messages are in French.

### Results

For a well-known leaked password, the tool reports that it appears several million times in known breaches and advises changing it everywhere it is in use (see the French section for the exact output).

Security: only a 5-hex-character prefix (out of 40) leaves the machine, over HTTPS to `api.pwnedpasswords.com`. Prefer the hidden input: a password passed as an argument stays in the shell history and may be visible in the process list.

### Limitations

- **Does not measure strength**: a password absent from breaches can still be weak. The tool complements a password manager, it does not replace it.
- **Depends on HIBP API availability**; without network access the tool returns an error (code `1`), not a false “not compromised”.
- **One password at a time**: no file or batch mode.
- **SHA-1 only**, the format served by the Pwned Passwords API; the NTLM endpoint is not implemented.
- Input masking rewrites the line; it is not a real no-echo terminal mode.
- No automated tests.

### Possible improvements

- Batch mode from standard input (one password per line), with a summary output.
- `--quiet` option to rely on the exit code only in scripts.
- Unit tests on the comparison function, with a mocked API response.

---

## Auteur / Author

**Lénusan Gunarajah** — ingénieur cybersécurité junior : audit de sécurité, sécurité des infrastructures et services managés. / Junior cybersecurity engineer: security auditing, infrastructure security and managed services.

- Portfolio : https://lenu-san.github.io
- GitHub : https://github.com/Lenu-san
- LinkedIn : https://www.linkedin.com/in/l%C3%A9nusan-g-0470b6336

## Licence / License

MIT
