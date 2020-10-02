## Before working on the bot...

1. Building will fail unless you put the needed keys and secrets required by all references to *user_creds.json*.
 Refer to the names of the classes that require which all of the services mentioned in the above file.

## Regarding Deployment

1. If you have VS Code, run the 'Build Deployable Build' to create a JS transpiled build of the bot.
Alernatively you can also run ```tsc`` on the project folder and grab the transpiled folder.
1. Copy and paste the project's 'package.json' to the root of '~/deploy'.
1. Delete all script lines but include ``` "start" : "node ./app/igniter'  ```
1. If building for Heroku create a Procfile on the root of '/~deploy'
1. Create a git repository and push changes to your Heroku branch.
