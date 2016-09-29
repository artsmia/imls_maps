To get this started:

* `npm install` - installs dependencies
* `npm run setup` - downloads info from the google spreadsheet and converts
  the markdown files into JSON
* `npm run start` - starts a server on `:3456`

You'll need a few environment variables:

```sh
export mapzenVectorTilesKey=… # mapzen api key
export deployServer=… # server to deploy via rsync/ssh
export deployLocation=… # path on server to deploy files
```

[Working
documents](https://drive.google.com/drive/u/0/folders/0BzMuloY4ICyVTFY3Qy15ZGo0MWs)
