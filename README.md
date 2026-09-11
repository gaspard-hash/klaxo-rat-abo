# klaxo-rat-abo
Klaxo — Envoi d'un nombre vers Make
Page d'une seule action : saisir un nombre, l'envoyer à un webhook Make.
L'URL du webhook reste côté serveur, elle n'est jamais exposée au navigateur.
Structure
public/index.html   page (branding Klaxo)
api/send.js         fonction serverless Vercel -> POST vers le webhook Make
package.json        "type": "module" (nécessaire pour la syntaxe export default)
​
Déploiement
Pousser ce dossier sur GitHub.
Sur Vercel : New Project -> importer le repo -> Framework preset Other.
Settings -> Environment Variables :
Name : webhook_make
Value : l'URL du webhook Make (https://hook.eu2.make.com/...)
Environments : Production, Preview, Development
Deploy. Redéployer après tout changement de variable : les variables
sont injectées au build, pas lues à chaud.
Flux
Navigateur -> POST /api/send { "number": 42 }
-> Vercel -> POST $webhook_make { "number": 42, "sentAt": "2026-09-11T…Z" }
Make reçoit du JSON : passer le webhook en "JSON pass-through" désactivé pour
que les champs number et sentAt soient mappables directement.
