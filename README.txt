On setup:

1. Building will fail unless you put the needed keys and secrets required by all references to user_creds.json.
 Refer to the names of the classes that require which service. Ex. GoogleImage requires a Custom Search key.

On deployment:

1. If you have VS Code, run the 'Build Deployable Build' to create a JS transpiled build of the bot.
2. Copy and paste the project's 'package.json' to the root of '~/deploy'.
3. Delete all script information but include >   "start" : "node ./app/igniter'   <.
4. If building for Heroku create a Procfile on the root of '/~deploy'
5. Create a git repository and push changes to your Heroku branch.