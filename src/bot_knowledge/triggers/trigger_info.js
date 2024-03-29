const TRIGGER_INFO = {
  help_author: 'Megadork Help',
  help_functions: {
    music: [
      'what can you play',
      'help play',
      'help music',
    ],
    anime: [
      'help anime',
      'help weeb',
    ],
    birthday: [
      'help birthday',
      'help birthday reminders',
    ],
    reddit: [
      'help reddit',
    ],
    image_search: [
      'help images',
      'help image search',
      'help image_search',
      'help google image',
      'help google images',
    ],
    twitter: [
      'help twitter',
      'help tweet',
      'help tweets',
    ],
    horoscope: [
      'help horoscope',
      'help horoscopes',
    ],
    quote: [
      'help quote',
      'help quotes',
    ],
    lyric: [
      'help lyrics',
      'help lyric',
    ],
    translate: [
      'help translate',
    ],
    magic_ball: [
      'help magic ball',
      'help magic_ball',
    ],
    dice: [
      'help dice',
    ],
    covid: [
      'help covid',
      'help covid-19',
      'help coronavirus',
    ],
    swear: [
      'help swear',
      'help swear jar',
      'help swear counter',
    ],
    suggest: [
      'help suggest',
      'help suggestion',
    ],
    joke: [
      'help joke',
      'help jokes',
    ],
    name: [
      'help name',
      'help name change',
    ],
    meme: [
      'help meme',
      'help meme generator',
    ],
    blizzard: [
      'help blizzard',
    ],
    gif: [
      'help gif',
      'help giphy',
    ],
    subscriptions: [
      'help subscription',
      'help subscriptions',
    ],
    stocks: [
      'help stocks',
      'help crypto',
      'help ecurrency',
      'help stock market',
    ],
    youtube: [
      'help youtube',
      'help yt',
    ],
    spotify: [
      'help spotify',
    ],
  },
  help_special: {
    general: [
      'what can you do',
      'help general',
      'help',
    ],
    music: [
      'what can you sing',
      'help music list',
      'music list',
      'song list',
    ],
    translate: [
      'translation list',
      'translation languages',
    ],
    meme: [
      'list memes',
      'list of memes',
      'memes list',
      'meme list',
      'meme store',
      'meme topics',
    ],
    subscription: [
      'subscription types',
      'subscription type list',
      'list subscription types',
      'list subscription functions',
      'list subscription abilities',
    ],
  },
  help_reference: {
    translate: [
      'distorted (and \'undistorted\')',
      'binary (and \'text from binary\')',
      'morse (and \'text from morse\')',
      'draenei',
      'dwarven',
      'gnomish',
      'darnassian',
      'thalassian',
      'gutterspeak',
      'orcish',
      'taurahe',
      'zandali',
      'eredun',
      'draconic',
      'kalimag',
      'yoda',
    ],
  },
  i: {
    birthday: {
      _title: 'Birthday Reminders',
      _description: 'Make Megadork remember your birthday and get alerts from it!',
      _footer: '🎂',
      _command_list: {
        self: {
          title: 'Remember birthday',
          example: 'megadork remember my birthday *month* *day* (*year*)',
        },
        inquire: {
          title: 'Ask birthday',
          example: 'megadork whats my birthday',
        },
      },
    },
    music: {
      _title: 'Music Player',
      _description: 'Have Megadork play music from YouTube or from local files. Queue system included as well. Keywords must be included after request. \n For a list of local songs, type in *megadork song list*.',
      _footer: '🎵',
      _command_list: {
        play: {
          title: '**Basic Request**',
          example: 'megadork play *URL/platform+name/localsongname*',
        },
        stop: {
          title: 'Stop Music',
          example: 'stop',
        },
        args: {
          loop: {
            title: 'Loop',
            example: '*request* looped',
          },
          yt: {
            title: 'YouTube search keyword',
            example: 'youtube *searchName*',
          },
          sc: {
            title: 'SoundCloud search keyword',
            example: 'soundcloud *searchName*',
          },
        },
        queue: {
          add: {
            title: 'Queue add',
            example: 'megadork jukebox add *song request*',
          },
          skip: {
            title: 'Queue skip',
            example: 'megadork skip next song',
          },
          start: {
            title: 'Queue start',
            example: 'megadork start jukebox',
          },
          play_next: {
            title: 'Queue play next',
            example: 'megadork play next',
          },
          next: {
            title: 'Queue check next',
            example: 'megadork jukebox next up',
          },
          list: {
            title: 'Queue check list',
            example: 'megadork jukebox list',
          },
        },
      },
    },
    image_search: {
      _title: 'Image Fetch',
      _description: 'Find an image from Google. Make a random search or something specific!',
      _footer: '📷',
      _command_list: {
        random_image: {
          title: 'Get photo (of *topic*)',
          example: 'megadork fetch photo *optionalRequest*',
        },
        dank_meme: {
          title: 'Get meme',
          example: 'megadork throw me a meme',
        },
      },
    },
    reddit: {
      _title: 'Birthday Reminders',
      _description: 'Pull info from Reddit such as posts, images, or even copypasta. Keywords come after base request.',
      _footer: '↕',
      _command_list: {
        'default': {
          title: '**Basic Request**',
          example: 'megadork fetch reddit',
        },
        query_type: {
          post: {
            title: 'Get post keyword',
            example: 'post from *r/subreddit / u/user*',
          },
          user: {
            title: 'Get user keyword',
            example: 'user *X*',
          },
        },
        copypasta: {
          'default': {
            title: 'Get random copypasta',
            example: 'megadork fetch copypasta',
          },
          top_of_week: {
            title: 'Get week\'s top copypasta',
            example: 'megadork fetch this week\'s copypasta',
          },
        },
        fiftyfifty: {
          'default': {
            title: 'Get random r/fiftyfifty post',
            example: 'megadork fetch 5050',
          },
          top_of_week: {
            title: 'Get week\'s top r/fiftyfifty post',
            example: 'megadork fetch this week\'s 5050',
          },
        },
        askreddit: {
          'default': {
            title: 'Get random askreddit post',
            example: 'megadork fetch askreddit',
          },
          top_of_week: {
            title: 'Get week\'s top askreddit post',
            example: 'megadork fetch this week\'s askreddit',
          },
        },
      },
    },
    twitter: {
      _title: 'Twitter Fetcher',
      _description: 'Get Twitter tweets from your favorite user or topic.',
      _footer: '🐦',
      _command_list: {
        'default': {
          title: '**Basic Request**',
          example: 'megadork fetch tweet',
        },
        queries: {
          query: {
            title: 'Fetch from topic',
            example: 'megadork fetch tweet about *topic*',
          },
          user_latest: {
            title: 'Fetch from user',
            example: 'megadork fetch tweet from *@user*',
          },
        },
      },
    },
    horoscope: {
      _title: 'Horocope Fetch',
      _description: 'Grab a crystal ball and see what life fortells from a dumb bot',
      _footer: '🔮',
      _command_list: {
        'default': {
          title: 'Fetch horoscope (WIP)',
          example: 'megadork fetch horoscope',
        },
      },
    },
    anime: {
      _title: 'Anime-worm',
      _description: 'Pull info from an anime from MyAnimeList. Find a specific one or get a random new one.',
      _footer: '🎌',
      _command_list: {
        'default': {
          title: 'Fetch specific anime info',
          example: 'megadork fetch anime *X*',
        },
        'new': {
          title: 'Fetch random new anime',
          example: 'megadork fetch new anime',
        },
      },
    },
    quote: {
      _title: 'Quote Digger',
      _description: 'Get quotes from a variety of topics such as art or management.',
      _footer: '⁉',
      _command_list: {
        'default': {
          title: '**Basic Request**',
          example: 'megadork fetch quote',
        },
        OTD: {
          'default': {
            title: 'Fetch random quote of the day',
            example: 'megadork random quote of the day (*optional topic*)',
          },
          topics: {
            title: '*Topic Keywords*',
            example: 'management, art, students, sports, life, funny, love',
          },
        },
        topics: {
          inspirational: {
            title: 'Fetch random inspirational quote',
            example: 'megadork fetch inspirational quote',
          },
          movie: {
            'default': {
              title: 'Fetch random movie quote',
              example: 'megadork random movie quote',
            },
          },
        },
      },
    },
    dice: {
      _title: 'Dice Roll',
      _description: 'Throw a dice. You can pick the size too!',
      _footer: '🎲',
      _command_list: {
        'default': {
          title: 'Roll a dice',
          example: 'megadork roll (*number size*)',
        },
      },
    },
    magic_ball: {
      _title: 'Magic 8 Ball',
      _description: 'Simple. RNG your wish.',
      _footer: '🎱',
      _command_list: {
        'default': {
          title: 'Roll a magic ball',
          example: 'megadork magic ball',
        },
      },
    },
    lyric: {
      _title: 'Lyric Fetching',
      _description: 'Pull some lyrics from your favorite song or something you don\'t understand!',
      _footer: '📝',
      _command_list: {
        'default': {
          title: 'Fetch a song\'s lyrics',
          example: 'megadork fetch song lyrics for *name of song*',
        },
      },
    },
    lyric_sing: {
      _title: 'Lyric Singing',
      _description: 'Get Megadork to send a TTS message with a snippet of a song\'s lyrics.',
      _footer: '🎤',
      _command_list: {
        'default': {
          title: 'Fire TTS message with song lyrics',
          example: 'megadork sing the song *name of song*',
        },
      },
    },
    translate: {
      _title: 'Translating',
      _description: 'Send text to Megadork to translate to a known language. *megadork translation list* for a list of languages.',
      _footer: '💬',
      _command_list: {
        'default': {
          title: 'Translate to (basic keyword)',
          example: 'megadork translate to',
        },
      },
    },
    covid: {
      _title: 'Coronavirus Info',
      _description: 'Find case info on COVID-19 in a specific location or the world.',
      _footer: '🦠',
      _command_list: {
        'default': {
          title: 'Fetch world cases',
          example: 'megadork fetch covid cases',
        },
        country: {
          title: 'Fetch state cases',
          example: 'megadork fetch covid cases for country *name of country*',
        },
        state: {
          title: 'Fetch country cases',
          example: 'megadork fetch covid cases for state *name of state*',
        },
        continent: {
          title: 'Fetch continent cases',
          example: 'megadork fetch covid cases for continent *name of state*',
        },
      },
    },
    swear: {
      _title: 'Swear Jar',
      _description: 'By default I come included with a bad word counter. I don\'t know why, but it\'s there.',
      _footer: '⁉',
      _command_list: {
        toggle: {
          title: 'Toggle your Swear Jar',
          example: 'megadork toggle swear jar',
        },
        whitelist_channel: {
          title: 'Disable swear notifications in channel',
          example: 'megadork whitelist swear',
        },
      },
    },
    suggest: {
      _title: 'Suggestion',
      _description: 'Something missing or just wanna bug the developer?',
      _footer: '📧',
      _command_list: {
        'default': {
          title: 'Send general mailed suggestion',
          example: 'megadork suggest *X*',
        },
      },
    },
    joke: {
      _title: 'Jokes',
      _description: 'Need a quick laugh? I got jokes! Credits to icanhazjoke, Chuck Norris API, and Jokes API for providing these fun phrases.',
      _footer: '📧',
      _command_list: {
        'default': {
          title: 'Get a joke',
          example: 'megadork get joke',
        },
        OTD: {
          'default': {
            title: 'Fetch joke of the day',
            example: 'megadork get joke of the day (*optional topic*)',
          },
          topics: {
            title: '*Topic Keywords*',
            example: 'animal, knock, blonde',
          },
        },
        chuck: {
          title: 'Fetch Chuck Norris joke',
          example: 'megadork get joke chuck',
        },
        dad: {
          title: 'Fetch a dad joke!',
          example: 'megadork get joke dad',
        },
        custom: {
          title: 'Fetch a customized name joke!',
          example: 'megadork get custom joke name *X* *X*',
        },
      },
    },
    name: {
      _title: 'Names',
      _description: 'Need a new name? (Megadork must be of a higher role than you to change your name!)',
      _footer: '🆔',
      _command_list: {
        random_name_change: {
          title: 'Change to random name',
          example: 'megadork random name change',
        },
        random_name_change_funky: {
          title: 'Change to random funky name',
          example: 'megadork random funky name change',
        },
        random_name_change_starwars: {
          title: 'Change to random Star Wars name',
          example: 'megadork random star wars name change',
        },
      },
    },
    meme: {
      _title: 'Memes 😂👌',
      _description: 'Need to fetch a special meme? Customized? Check this out! (type **;meme list** to see what meme topics are available.)',
      _footer: '😜',
      _command_list: {
        base_request: {
          title: 'Basic meme request',
          example: 'megadork fetch meme',
        },
        fetch_specific_meme: {
          title: 'Get meme for a specific topic',
          example: 'megadork fetch meme ***topic***',
        },
        fetch_custom_meme: {
          title: 'Generate meme with text',
          example: 'megadork fetch meme ***topic*  "text1" "text2"** (depending on your meme, 1-3 texts are supported.) ',
        },
      },
    },
    blizzard: {
      _title: 'Blizzard Info',
      _description: 'Get information on a Blizzard game such as a character profile or item.',
      _footer: '🅱',
      _command_list: {
        wow_character: {
          title: 'World of Warcraft character profile',
          example: 'megadork fetch wow character *character* of *realm*',
        },
      },
    },
    gif: {
      _title: 'GIF Fetch',
      _description: 'Get a random GIF or a specific GIF based on a request (Uses GIPHY)',
      _footer: '😎',
      _command_list: {
        random_gif: {
          title: 'Fetch random GIF from GIPHY',
          example: 'megadork fetch random gif',
        },
      },
    },
    subscriptions: {
      _title: 'Subscriptions',
      _description: 'Subscription management for automating functions to your channel! Type **;list subscription types** for available functions.',
      _footer: '⚡',
      _command_list: {
        create_subscription: {
          title: 'Create subscription',
          example: 'megadork create subscription ***name*** for ***function code***',
        },
        get_subscription: {
          title: 'Get subscription\'s info',
          example: 'megadork get subscription ***name***',
        },
        get_all_subscriptions: {
          title: 'Get a channel\'s available subscriptions',
          example: 'megadork get subscriptions',
        },
        change_subscription: {
          title: 'Edit subscription',
          example: 'megadork change subscription \'***name***\' ***attribute*** to ***x*** (Attributes: time, name, toggle, functiontype)',
        },
        delete_subscription: {
          title: 'Delete subscription',
          example: 'megadork delete subscription ***name***',
        },
      },
    },
    stocks: {
      _title: 'Stock Market and eCurrency Lookup',
      _description: 'Fetch daily stats on a chosen',
      _footer: '😎',
      _command_list: {
        daily_stock: {
          title: 'Fetch today\'s info for a stock ticker',
          example: 'megadork fetch ticker **$LOL**',
        },
        specific_day_stock: {
          title: 'Fetch a specific day\'s info for a stock ticker',
          example: 'megadork fetch ticker **$LOL** on **January 20 2020**',
        },
        daily_crypto: {
          title: 'Fetch today\'s info for a cryptocurrency',
          example: 'megadork fetch crypto **$LOL**',
        },
        specific_day_crypto: {
          title: 'Fetch a specific day\'s info for a cryptocurrency',
          example: 'megadork fetch crypto **$LOL** on **January 20 2020**',
        },
      },
    },
    youtube: {
      _title: 'YouTube Video and Stream Lookup',
      _description: 'Find some videos and look up any livestreams!',
      _footer: '😎',
      _command_list: {
        stream_check: {
          title: 'See if a channel is livestreaming',
          example: 'megadork youtube stream check **X**',
        },
        new_vid_check: {
          title: 'Check if channel posted new video today',
          example: 'megadork youtube check youtube new vid **X**',
        },
      },
    },
    spotify: {
      _title: 'Spotify Info Lookup',
      _description: 'Find information on tracks, albums, playlist, personalized recommendations, etc.',
      _footer: '🎵',
      _command_list: {
        track_recommendations: {
          title: 'Get a recommendation based off a link',
          example: 'megadork get recommendation from spotify **https: //open.spotify.com/whatever**',
        },
        track_recommendations_genre: {
          title: 'Get a recommendation based off a genre',
          example: 'megadork get recommendation from spotify genre **genre code**',
        },
        track_genres: {
          title: 'Get recommendation genres (in codes)',
          example: 'megadork get spotify genres',
        },
      },
    },
    faculty_uw: {
      _title: 'UW Faculty Lookup',
      _description: 'Look up contact info on UW Faculty members',
      _footer: '🏫',
      _command_list: {
        faculty_lookup: {
          title: 'Look up a faculty member\'s contact info (If you get a different teacher, try using a more specific name.)',
          example: 'megadork fetch uw faculty **nan mary sauce**',
        },
      },
    },
  },
}

export default TRIGGER_INFO