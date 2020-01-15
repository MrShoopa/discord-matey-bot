import winston from 'winston';

const myCustomLevels: winston.config.AbstractConfigSetLevels = {
	foo: 0,
	bar: 1,
	baz: 2,
	foobar: 3
};

interface CustomLevels extends winston.Logger {
	foo: winston.LeveledLogMethod;
	bar: winston.LeveledLogMethod;
	baz: winston.LeveledLogMethod;
	foobar: winston.LeveledLogMethod;
}

const MateyLogger: CustomLevels = <CustomLevels>winston.createLogger({
	levels: myCustomLevels,
	transports: [
		new winston.transports.Console({
			level: 'foobar'
		})
	]
});

MateyLogger.foobar('some foobar level-ed message');

export default MateyLogger;