const TRIGGERS = {
  main_trigger: [
    ';megadork',
    ';dork',
    ';mega',
    'megadork',
    'cyberplop',
    'megadick',
    'megafaggot',
    'md',
    '!mega',
    '.m',
    ';',
  ],
  redo_trigger: [
    'redo',
    'redo that',
    'rewind that',
    'do that again',
  ],
  kill_trigger: [
    'go kill yourself',
    'reset please',
    'do me a favor and kill yourself',
    'restart',
    'reboot',
  ],
  url_trigger: {
    any: '.',
  },
  context_prefix: [
    'for',
    'of',
    'from',
    'with',
    'about',
    'showing',
    'that has',
    'that includes',
  ],
  third_person_phrase_triggers: {
    suck_thing: [
      'suck',
      'dick',
    ],
    self_death_wish: {
      die: [
        'i wanna die',
        'can i die',
      ],
      kill_self: [
        'kill myself',
      ],
    },
  },
  send_nude_triggers: [
    'send nudes',
    'send noodz',
    'send hot nudes',
  ],
  thank_you_triggers: [
    'thanks',
    'thank you',
    'thank you megadork',
    'thanks megadork',
    'god bless megadork',
  ],
  are_you_triggers: {
    communist: 'are you a communist',
    real: 'are you real',
    'robot:': 'are you a robot',
  },
  threat: {
    kill_self: [
      'kill yourself',
      'die',
      'go die',
      'you\'re worthless',
      'eat shit',
      'fuck you',
      'you suck',
      'sucks dick',
    ],
  },
  how_is_bot: [
    'how are you',
  ],
  your_mom_direct: [
    'ur mom',
    'your mom',
    'ur mum',
    'your mum',
    'yur mom',
    'yur mum',
  ],
  remember: {
    birthday: {
      self: [
        'remember my birthday',
        'remember my birthday\'s',
        'remember my birthday\'s on',
        'remember that my birthday is',
        'my birthday\'s on',
        'my birthday is on',
        'celebrate my birthday on',
        'set my birthday to',
        'change my birthday to',
      ],
      inquire: [
        'birthday',
        'my birthday',
        'whats my birthday',
        'what\'s my birthday',
        'whens my birthday',
        'when\'s my birthday',
        'my birthday',
        'tell me my birthday',
        'when was i born',
        'when do i turn',
      ],
    },
  },
  singing_triggers: {
    play: [
      'play',
    ],
    stop: [
      'stop',
      'stop music',
      'kill music',
      'kill the noise',
    ],
    args: {
      loop: [
        'loop',
        'looped',
        'on repeat',
        'repeat',
        'repeated',
      ],
      shuffle: [
        'shuffle',
        'shuffled',
        'randomized',
        'scattered',
      ],
      platform: {
        yt: [
          'yt',
          'youtube',
          'YouTube',
        ],
        sc: [
          'sc',
          'soundcloud',
          'SoundCloud',
        ],
      },
    },
    queue: {
      add: [
        'song list add',
        'jukebox add',
        'add song',
        'enqueue',
        'juke add',
        'music queue add',
        'add to queue',
        'i request the song',
        'add to music queue',
      ],
      skip: [
        'skip next',
        'skip next song',
        'avoid next song',
        'omit next song',
        'remove next song',
      ],
      start: [
        'juke go',
        'juke start',
        'start juke',
        'start jukebox',
        'jukebox start',
        'begin jukebox',
        'jukebox ignite',
        'fire jukebox',
        'fire juke',
        'start music queue',
        'music queue start',
        'begin music queue',
        'music queue ignite',
        'fire music queue',
      ],
      play_next: [
        'shift track',
        'play next',
        'start next',
        'next song',
        'play next song',
        'start next song',
        'begin next song',
        'do next song',
      ],
      inquire: {
        next: [
          'what\'s the next song',
          'juke next up',
          'jukebox next up',
          'peek song',
          'peek next song',
          'jukebox next song',
          'check next song',
          'music queue next up',
        ],
        list: [
          'jukebox',
          'music list',
          'juke',
          'juke list',
          'get jukebox',
          'get music list',
          'get juke',
          'music queue',
          'jukebox list',
          'jukebox queue',
          'what\'s on the jukebox',
          'what\'s on the music queue',
          'music requests',
        ],
      },
    },
  },
  server_mod_triggers: {
    set_restricted_role: [
      'banish',
      'cage',
      'jail',
      'unmeme',
      'throw away',
    ],
    unset_restricted_role: [
      'unbanish',
      'uncage',
      'revive',
      'bailout',
    ],
    get_roles: [
      'roles',
      'my roles',
      'whats my role',
      'what are my roles',
      'what\'s my role',
      'what role am I',
    ],
  },
  image_search_triggers: {
    random_image: [
      'search image',
      'image search',
      'random image',
      'random photo',
      'random picture',
      'fetch picture',
      'fetch photo',
      'fetch pic',
      'fetch image',
      'fetch a pic',
      'fetch a picture',
      'fetch me a picture',
      'fetch image',
      'find picture',
      'find a picture',
      'find a random picture',
      'find me picture',
      'find me a picture',
      'find me a random picture',
      'get picture',
      'get a picture',
      'get me a picture',
      'get me an image',
      'get me a photo',
      'get me a random image',
      'get me a random picture',
      'give me an image',
      'give me a photo',
      'give me a random image',
      'give me a random picture',
      'send me a picture',
      'send me a photo',
      'send me a random image',
      'send me a random picture',
      'show me a picture',
      'show me a photo',
      'show me a random image',
      'show me a random picture',
      'throw me a random picture',
    ],
    dank_meme: [
      'dank meme',
      'send dank meme',
      'throw me a meme',
      'send me a meme',
      'meme me',
      'show me memes',
      'send dank memes',
    ],
  },
  swear_jar_triggers: {
    toggle: [
      'tick swear',
      'toggle swear',
      'switch swear',
      'flip swear',
      'tick swear jar',
      'toggle swear jar',
      'switch swear jar',
      'flip swear jar',
      'tick swear game',
      'toggle swear game',
      'switch swear game',
      'flip swear game',
    ],
    whitelist: [
      'whitelist swear',
      'toggle swear in channel',
      'switch channel swear jar',
      'flip channel swear jar',
      'tick swear in channel',
      'toggle swear in channel',
      'switch swear in channel',
      'flip swear in channel',
      'tick channel swear',
      'toggle channel swear',
      'switch channel swear',
      'flip channel swear',
    ],
    count: [
      'swear count',
      'swear jar count',
      'swear times',
      'swear stats',
      'bad word count',
      'cuss count',
      'how many swears',
      'how many times did i swear',
    ],
    server_stats: [
      'swear leaderboard',
      'swear jar leaderboard',
      'swear stats',
      'swear server stats',
      'bad word server count',
      'bad word total count',
      'show swear stats',
      'show swear stats for sever',
    ],
    bad_words: [
      '4r5e',
      '5h1t',
      '5hit',
      'a55',
      'anal',
      'anus',
      'ar5e',
      'arrse',
      'arse',
      'ass',
      'ass-fucker',
      'asses',
      'assfucker',
      'assfukka',
      'asshole',
      'assholes',
      'asswhole',
      'a_s_s',
      'b!tch',
      'b00bs',
      'b17ch',
      'b1tch',
      'ballbag',
      'ballsack',
      'bastard',
      'beastial',
      'beastiality',
      'bellend',
      'bestial',
      'bestiality',
      'bi+ch',
      'biatch',
      'bitch',
      'bitcher',
      'bitchers',
      'bitches',
      'bitchin',
      'bitching',
      'bloody',
      'blow job',
      'blowjob',
      'blowjobs',
      'boiolas',
      'bollock',
      'bollok',
      'boner',
      'boob',
      'boobs',
      'booobs',
      'boooobs',
      'booooobs',
      'booooooobs',
      'breasts',
      'buceta',
      'bugger',
      'bum',
      'bunny fucker',
      'butt',
      'butthole',
      'buttmuch',
      'buttplug',
      'c0ck',
      'c0cksucker',
      'carpet muncher',
      'cawk',
      'chink',
      'cipa',
      'cl1t',
      'clit',
      'clitoris',
      'clits',
      'cnut',
      'cock',
      'cock-sucker',
      'cockface',
      'cockhead',
      'cockmunch',
      'cockmuncher',
      'cocks',
      'cocksuck',
      'cocksucked',
      'cocksucker',
      'cocksucking',
      'cocksucks',
      'cocksuka',
      'cocksukka',
      'cok',
      'cokmuncher',
      'coksucka',
      'coon',
      'cox',
      'crap',
      'cum',
      'cummer',
      'cumming',
      'cums',
      'cumshot',
      'cunilingus',
      'cunillingus',
      'cunnilingus',
      'cunt',
      'cuntlick',
      'cuntlicker',
      'cuntlicking',
      'cunts',
      'cyalis',
      'cyberfuc',
      'cyberfuck',
      'cyberfucked',
      'cyberfucker',
      'cyberfuckers',
      'cyberfucking',
      'd1ck',
      'damn',
      'dick',
      'dickhead',
      'dildo',
      'dildos',
      'dink',
      'dinks',
      'dirsa',
      'dlck',
      'dog-fucker',
      'doggin',
      'dogging',
      'donkeyribber',
      'doosh',
      'duche',
      'dyke',
      'ejaculate',
      'ejaculated',
      'ejaculates',
      'ejaculating',
      'ejaculatings',
      'ejaculation',
      'ejakulate',
      'f u c k',
      'f u c k e r',
      'f4nny',
      'fag',
      'fagging',
      'faggitt',
      'faggot',
      'faggs',
      'fagot',
      'fagots',
      'fags',
      'fanny',
      'fannyflaps',
      'fannyfucker',
      'fanyy',
      'fatass',
      'fcuk',
      'fcuker',
      'fcuking',
      'feck',
      'fecker',
      'felching',
      'fellate',
      'fellatio',
      'fingerfuck',
      'fingerfucked',
      'fingerfucker',
      'fingerfuckers',
      'fingerfucking',
      'fingerfucks',
      'fistfuck',
      'fistfucked',
      'fistfucker',
      'fistfuckers',
      'fistfucking',
      'fistfuckings',
      'fistfucks',
      'flange',
      'fook',
      'fooker',
      'fuc',
      'fucc',
      'fuccc',
      'fucccc',
      'fuccccc',
      'fucccccc',
      'fuccccccc',
      'fuck',
      'fuuck',
      'fuuuck',
      'fuuuuck',
      'fuuuuuck',
      'fuuuck',
      'fucck',
      'fuccck',
      'fucccck',
      'fuccckk',
      'fucckk',
      'fuckk',
      'fuckkk',
      'fuckkkk',
      'fucka',
      'fucked',
      'fucker',
      'fuckers',
      'fuckhead',
      'fuckheads',
      'fuq',
      'fuqq',
      'fuuq',
      'fuckin',
      'fuckin\'',
      'fucking',
      'fuckings',
      'fuckingshitmotherfucker',
      'fuckme',
      'fucks',
      'fuckwhit',
      'fuckwit',
      'fudge packer',
      'fudgepacker',
      'fuk',
      'fuker',
      'fukker',
      'fukkin',
      'fuks',
      'fukwhit',
      'fukwit',
      'fux',
      'fux0r',
      'f_u_c_k',
      'gangbang',
      'gangbanged',
      'gangbangs',
      'gaylord',
      'gaysex',
      'goatse',
      'God',
      'god-dam',
      'god-damned',
      'goddamn',
      'goddamned',
      'hardcoresex',
      'hell',
      'heshe',
      'hoar',
      'hoare',
      'hoer',
      'homo',
      'hore',
      'horniest',
      'horny',
      'hotsex',
      'jack-off',
      'jackoff',
      'jerk-off',
      'jism',
      'jiz',
      'jizm',
      'jizz',
      'kawk',
      'knob',
      'knobead',
      'knobed',
      'knobend',
      'knobhead',
      'knobjocky',
      'knobjokey',
      'kock',
      'kondum',
      'kondums',
      'kum',
      'kummer',
      'kumming',
      'kums',
      'kunilingus',
      'l3i+ch',
      'l3itch',
      'labia',
      'lust',
      'lusting',
      'm0f0',
      'm0fo',
      'm45terbate',
      'ma5terb8',
      'ma5terbate',
      'masochist',
      'master-bate',
      'masterb8',
      'masterbat*',
      'masterbat3',
      'masterbate',
      'masterbation',
      'masterbations',
      'masturbate',
      'mo-fo',
      'mof0',
      'mofo',
      'mothafuck',
      'mothafucka',
      'mothafuckas',
      'mothafuckaz',
      'mothafucked',
      'mothafucker',
      'mothafuckers',
      'mothafuckin',
      'mothafucking',
      'mothafuckings',
      'mothafucks',
      'mother fucker',
      'motherfuck',
      'motherfucked',
      'motherfucker',
      'motherfuckers',
      'motherfuckin',
      'motherfucking',
      'motherfuckings',
      'motherfuckka',
      'motherfucks',
      'muff',
      'mutha',
      'muthafecker',
      'muthafuckker',
      'muther',
      'mutherfucker',
      'n1gga',
      'n1gger',
      'nazi',
      'nigg3r',
      'nigg4h',
      'nigga',
      'niggah',
      'niggas',
      'niggaz',
      'nigger',
      'niggers',
      'nob',
      'nob jokey',
      'nobhead',
      'nobjocky',
      'nobjokey',
      'numbnuts',
      'nutsack',
      'orgasim',
      'orgasims',
      'orgasm',
      'orgasms',
      'p0rn',
      'pawn',
      'pecker',
      'penis',
      'penisfucker',
      'phonesex',
      'phuck',
      'phuk',
      'phuked',
      'phuking',
      'phukked',
      'phukking',
      'phuks',
      'phuq',
      'pigfucker',
      'pimpis',
      'piss',
      'pissed',
      'pisser',
      'pissers',
      'pisses',
      'pissflaps',
      'pissin',
      'pissing',
      'pissoff',
      'poop',
      'porn',
      'porno',
      'pornography',
      'pornos',
      'prick',
      'pricks',
      'pron',
      'pube',
      'pusse',
      'pussi',
      'pussies',
      'pussy',
      'pussys',
      'rectum',
      'retard',
      'rimjaw',
      'rimming',
      's hit',
      's.o.b.',
      'sadist',
      'schlong',
      'screwing',
      'scroat',
      'scrote',
      'scrotum',
      'semen',
      'sex',
      'sh!+',
      'sh!t',
      'sh1t',
      'shag',
      'shagger',
      'shaggin',
      'shagging',
      'shemale',
      'shi+',
      'shit',
      'shitdick',
      'shite',
      'shited',
      'shitey',
      'shitfuck',
      'shitfull',
      'shithead',
      'shiting',
      'shitings',
      'shits',
      'shitted',
      'shitter',
      'shitters',
      'shitting',
      'shittings',
      'shitty',
      'skank',
      'slut',
      'sluts',
      'smegma',
      'smut',
      'snatch',
      'son-of-a-bitch',
      'spac',
      'spunk',
      's_h_i_t',
      't1tt1e5',
      't1tties',
      'teets',
      'teez',
      'testical',
      'testicle',
      'thot',
      'tit',
      'titfuck',
      'tits',
      'titt',
      'tittie5',
      'tittiefucker',
      'titties',
      'tittyfuck',
      'tittywank',
      'titwank',
      'tosser',
      'turd',
      'tw4t',
      'twat',
      'twathead',
      'twatty',
      'twunt',
      'twunter',
      'v14gra',
      'v1gra',
      'vagina',
      'viagra',
      'vulva',
      'w00se',
      'wang',
      'wank',
      'wanker',
      'wanky',
      'whoar',
      'whore',
      'willies',
      'willy',
      'xrated',
      'xxx',
    ],
  },
  reddit_fetch: {
    'default': [
      'fetch reddit',
    ],
    query_type: {
      post: [
        'post',
        'submission',
        'posting',
      ],
      user: [
        'user',
      ],
    },
    copypasta: {
      'default': [
        'copypasta',
        'fresh copypasta',
        'top new copypasta',
        'fetch copypasta',
        'fetch fresh copypasta',
        'fetch top new copypasta',
      ],
      top_of_week: [
        'weekly copypasta',
        'fetch this week\'s copypasta',
        'get this week\'s copypasta',
      ],
    },
    fiftyfifty: {
      'default': [
        'fiftyfifty',
        'fresh fiftyfifty',
        'top new fiftyfifty',
        'fetch fiftyfifty',
        'fetch fresh fiftyfifty',
        'fetch top new fiftyfifty',
        '5050',
        'fresh 5050',
        'top new 5050',
        'fetch 5050',
        'fetch fresh 5050',
        'fetch top new 5050',
      ],
      top_of_week: [
        'weekly fiftyfifty',
        'fetch this week\'s fiftyfifty',
        'get this week\'s fiftyfifty',
        'weekly 5050',
        'fetch this week\'s 5050',
        'get this week\'s 5050',
      ],
    },
    askreddit: {
      'default': [
        'askreddit',
        'fresh askreddit',
        'top new askreddit',
        'fetch askreddit',
        'fetch fresh askreddit',
        'fetch top new askreddit',
      ],
      top_of_week: [
        'weekly askreddit',
        'fetch this week\'s askreddit',
        'get this week\'s askreddit',
      ],
    },
  },
  twitter_fetch: {
    tweet: {
      'default': [
        'fetch tweet',
        'fetch a tweet',
        'fetch new tweet',
        'fetch fresh tweet',
        'fetch fresh new tweet',
        'fetch top new tweet',
        'fetch twitter tweet',
        'get tweet',
        'get a tweet',
        'get new tweet',
        'get fresh tweet',
        'get fresh new tweet',
        'get top new tweet',
        'get twitter tweet',
      ],
      query: [
        'fetch tweet about',
        'fetch a tweet about',
        'fetch new tweet about',
        'fetch fresh tweet about',
        'fetch fresh new tweet about',
        'fetch top new tweet about',
        'fetch twitter tweet about',
        'get tweet about',
        'get a tweet about',
        'get new tweet about',
        'get fresh tweet about',
        'get fresh new tweet about',
        'get top new tweet about',
        'get twitter tweet about',
      ],
      user_latest: [
        'fetch tweet from',
        'fetch a tweet from',
        'fetch new tweet from',
        'fetch fresh tweet from',
        'fetch fresh new tweet from',
        'fetch top new tweet from',
        'fetch twitter tweet from',
        'get tweet from',
        'get a tweet from',
        'get new tweet from',
        'get fresh tweet from',
        'get fresh new tweet from',
        'get top new tweet from',
        'get twitter tweet from',
      ],
    },
  },
  horoscope_fetch: {
    'default': [
      'fetch horoscope',
      'fetch horoscope reading',
      'fetch new horoscope',
      'get horoscope',
      'get horoscope reading',
      'get new horoscope',
      'get new horoscope reading',
      'get a horoscope',
      'get a horoscope reading',
    ],
  },
  anime_fetch: {
    'default': [
      'fetch anime',
      'get anime',
      'get an anime',
    ],
    'new': [
      'fetch new anime',
      'get new anime',
      'get a new anime',
    ],
  },
  manga_fetch: {
    'default': [
      'fetch manga',
      'get manga',
      'get an manga',
    ],
    'new': [
      'fetch new manga',
      'get new manga',
      'get a new manga',
    ],
  },
  quote_fetch: {
    'default': [
      'quote',
      'random quote',
      'fetch quote',
      'fetch a quote',
      'fetch quote',
      'fetch a quote',
      'get quote',
      'get a quote',
      'give quote',
      'give a quote',
      'give me a quote',
    ],
    OTD: {
      'default': [
        'quote of the day',
        'random quote of the day',
        'fetch quote of the day',
        'fetch a quote of the day',
        'fetch me quote of the day',
        'get quote of the day',
        'get a quote of the day',
        'give quote of the day',
        'give a quote of the day',
        'give me quote of the day',
      ],
      sub_triggers: [
        'management',
        'art',
        'students',
        'sports',
        'life',
        'funny',
        'love',
      ],
    },
    inspirational: [
      'inspirational quote',
      'fetch inspirational quote',
      'fetch an inspirational quote',
      'get inspirational quote',
      'get an inspirational quote',
      'give inspirational quote',
      'give an inspirational quote',
      'give me an inspirational quote',
    ],
    movie: {
      'default': [
        'movie quote',
        'random movie quote',
        'fetch movie quote',
        'fetch a movie quote',
        'fetch movie quote',
        'fetch a movie quote',
        'get movie quote',
        'get a movie quote',
        'give movie quote',
        'give a movie quote',
        'give me a movie quote',
      ],
    },
    star_wars: {
      'default': [
        'star wars quote',
        'random star quote',
        'fetch star wars quote',
        'fetch a star wars quote',
        'fetch star wars quote',
        'fetch a star wars quote',
        'get star wars quote',
        'get a star wars quote',
        'give star wars quote',
        'give a star wars quote',
        'give me a star wars quote',
      ],
    },
  },
  dice_roll: [
    'roll',
    'roll dice',
    'roll a dice',
    'diceroll',
    'throw dice',
    'throw a dice',
  ],
  lyric_fetch: {
    'default': [
      'fetch song lyrics from',
      'fetch song lyrics for',
      'fetch song lyrics of',
      'get lyrics from',
      'get lyrics for',
      'get lyrics of',
      'fetch lyrics about',
      'fetch lyrics from',
      'fetch lyrics for',
      'fetch lyrics of',
      'fetch some lyrics',
      'fetch lyrics',
      'lyrics from',
    ],
  },
  lyric_sing: {
    'default': [
      'sing the song',
      'sing song',
      'sing',
      'rap the song',
      'rap song',
      'rap',
    ],
  },
  translate: {
    hotword_to: [
      'translate to',
    ],
    hotword_default: [
      'translate',
    ],
    warcraft: [
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
      'kalimag',
    ],
    yoda: [
      'yoda',
      'yoda speak',
    ],
    binary: [
      'binary',
      'binary text',
      'hackerspeak',
      'text from binary',
    ],
    morse: {
      'default': [
        'morse',
        'morse speak',
        'beepspeak',
      ],
      to: [
        'to morse',
        'to morse speak',
      ],
      from: [
        'to text from morse',
        'to text from morse speak',
      ],
    },
    distorted: {
      base: [
        'distorted',
        'zalgo',
      ],
      to: [
        'disorted',
        'zalgo',
        'to distorted',
        'to distorted speak',
        'to distorted text',
        'to zalgo',
        'to zalgo speak',
        'to zalgo text',
      ],
      from: [
        'undistorted',
        'to text from distorted',
        'to text from distorted speak',
        'to text from distorted text',
        'to text from zalgo',
        'to text from zalgo speak',
        'to text from zalgo text',
      ],
    },
  },
  covid: {
    'default': [
      'fetch covid',
      'fetch covid-19',
      'fetch covid cases',
      'fetch covid-19 cases',
      'fetch coronavirus',
      'fetch coronavirus cases',
      'covid',
      'covid-19',
      'covid cases',
      'covid-19 cases',
      'coronavirus',
      'coronavirus cases',
    ],
    country: [
      'country',
      'region',
      'nation',
    ],
    state: [
      'state',
      'province',
    ],
    continent: [
      'continent',
    ],
  },
  magic_ball: [
    'magic_ball',
    'magic ball',
    'magic 8 ball',
    '8ball',
    '8 ball',
    '8_ball',
  ],
  google_search_triggers: {
    base_request: [
      'google',
      'bing',
      'search',
      'search result',
      'get search',
      'get search result',
      'random search',
      'fetch search',
      'find search',
    ],
    lucky: [
      'lucky search',
      'feeling lucky',
      'feelin\' lucky',
      'feelin lucky',
    ],
    safe_off: [
      'unsafe search',
      'nsfw search',
      'search safesearch off',
    ],
  },
  user_suggestion: {
    'default': [
      'suggest',
      'suggestion',
      'suggest to dev',
      'suggestion to dev',
      'suggest to developer',
      'suggestion to developer',
    ],
  },
  joke: {
    'default': [
      'joke',
      'get joke',
      'get a joke',
      'get me a joke',
      'fetch joke',
      'fetch a joke',
      'fetch me a joke',
      'joke me',
    ],
    of_the_day: {
      base: [
        'of day',
        'of the day',
        'of today',
        'today',
      ],
      blonde: [
        'blonde',
        'white',
      ],
      knock: [
        'knock',
      ],
      animal: [
        'animal',
      ],
    },
    chuck: [
      'chuck',
      'norris',
    ],
    custom: [
      'custom',
      'custom for',
      'custom with name',
    ],
    dad: [
      'dad',
      'cringe',
    ],
  },
  name_change: {
    'default': [
      'give me random name',
      'change my name',
      'random name change',
    ],
    funky: [
      'give me random funky name',
      'change my name to a funky one',
      'funky random name change',
      'random funky random name change',
    ],
    star_wars: [
      'give me random star wars name',
      'change my name to a star wars one',
      'star wars name change',
      'random star wars name change',
    ],
  },
  meme_triggers: {
    base: [
      'fetch meme',
      'get meme',
      'custom meme',
      'meme photo',
    ],
    categories: [
      'doge',
      'bling',
      'brain',
      'spongebob',
      'trump signing',
      'uno cards',
      'handshake',
      'monkey puppet',
      'bernie',
      'more of that',
      'star wars yoda',
      'waiting skeleton',
      'keanu',
      'too damn high',
      'sad pablo',
      'look at me',
    ],
  },
  blizzard: {
    warcraft: {
      character_profile: [
        'wow character',
        'warcraft character',
        'get wow character',
        'get warcraft character',
        'fetch wow character',
        'fetch warcraft character',
      ],
    },
  },
  giphy: {
    random_gif: [
      'random gif',
      'fetch random gif',
      'get random gif',
      'give me a random gif',
    ],
  },
  ping_pong: {
    'default': [
      'ping',
    ],
  },
  subscription: {
    create_general: [
      'create subscription',
      'make subscription',
    ],
    delete_general: [
      'delete subscription',
    ],
    update_general: [
      'update subscription',
      'change subscription',
    ],
    get_general: [
      'get subscription',
      'find subscription',
      'fetch subscription',
    ],
    list_general: [
      'list subscriptions',
      'get subscriptions',
      'fetch subscriptions',
    ],
    update: {
      params: {
        name: [
          'name',
          'title',
        ],
        time: [
          'time',
          'time start',
          'time beginning',
          'checkpoint',
        ],
        interval: [
          'frequency',
          'interval',
          'time frequency',
          'time interval',
        ],
        'function': [
          'function',
        ],
        toggle: [
          'toggle',
        ],
      },
    },
  },
  finance: {
    stock_market: {
      'default': [
        'fetch stock',
        'fetch ticker',
      ],
    },
    crypto: {
      'default': [
        'fetch crypto',
        'fetch ecurrency',
      ],
    },
  },
  youtube: {
    live: {
      'default': [
        'youtube stream check',
        'is youtube streaming',
        'check youtube stream',
        'fetch youtube stream status',
      ],
    },
    new_video: {
      'default': [
        'youtube check new vid',
        'youtube check new video',
        'is there a new video from',
        'check youtube new vid',
        'check youtube new video',
        'fetch youtube new vid',
        'fetch youtube new video',
        'check new youtube vid',
        'check new youtube video',
        'fetch new youtube vid',
        'fetch new youtube video',
      ],
    },
  },
  spotify: {
    recomendations: {
      base: [
        'fetch spotify recommendation',
        'get spotify recommendation',
        'retrieve spotify recommendation',
        'fetch recommendation from spotify',
        'get recommendation from spotify',
        'retrieve recommendation from spotify',
        'what\'s a good song based off',
        'give me a good song from',
      ],
      limit: [
        'limit',
        'limit of',
        'limit to',
      ],
      genres: [
        'get spotify genres',
        'fetch spotify genres',
        'get spotify recommendation genres',
        'fetch spotify recommendation genres',
        'get spotify track genres',
        'fetch spotify track genres',
      ],
    },
  },
  text_edit: {
    'super': [
      't^',
      'text^',
      'text-super',
      'text-superscript',
    ],
    sub: [
      't.',
      'text.',
      'text-sub',
      'text-subscript',
    ],
    big: [
      't+',
      'text+',
      'text-big',
    ],
  },
  faculty_search: {
    query: [
      'fetch faculty for',
      'fetch faculty on',
      'fetch faculty about',
      'fetch faculty info for',
      'fetch faculty info on',
      'fetch faculty info about',
      'fetch faculty contact for',
      'fetch faculty contact on',
      'fetch faculty contact about',
      'fetch faculty contact info for',
      'fetch faculty contact info on',
      'fetch faculty contact info about',
      'fetch uw faculty',
      'fetch uw faculty info for',
      'fetch uw faculty info on',
      'fetch uw faculty info about',
      'fetch uw faculty contact for',
      'fetch uw faculty contact on',
      'fetch uw faculty contact about',
      'fetch uw faculty contact info for',
      'fetch uw faculty contact info on',
      'fetch uw faculty contact info about',
    ],
    random: [
      'fetch random faculty',
      'fetch random uw faculty',
    ],
  },
  current_time: {
    default: [
      `get time`,
      `fetch time`,
      `get current time`,
      'fetch current time',
      `what's the time`,
      'what time is it',
    ],
    utc: [
      'get utc',
      'fetch utc',
      'get utc time',
      'fetch utc time',
      'fetch current utc time',
      'get current utc time',
      `what's the utc time`,
      `what's the time in utc`,
      `what time is it in utc`
    ]
  },
  conversational: {
    whats_your_name: [
      "whats your name",
      "what's your name",
      "what is your name",
      "what are you called",
    ],
    whos_your_creator: [
      "who is your creator",
      "who's your creator",
      "who is your daddy",
      "who's your daddy",
      "who created you",
    ],
    whats_the_hurry: [
      "whats the hurry",
      "whats the rush",
      "kaeya",
    ],
    food_list: [
      "banh mi",
      "banana",
      "taco",
    ],
  }
}

export default TRIGGERS