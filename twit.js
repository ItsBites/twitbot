var tw = require('twit');
var http = require('http');
var server = http.createServer();
var username = '@estgfbot';
var config = require("./config.js");
var base64 = require('node-base64-image');
var giphy = require('giphy-api')( config.giphy);

var t = new tw({
	consumer_key: config.consumer_key,
	consumer_secret: config.consumer_secret,
	access_token: config.access_token,
	access_token_secret: config.access_token_secret
});

var stream = t.stream('statuses/filter', { track: [username] });

stream.on('tweet', function(tweet){
	console.log(tweet);
	generateGif(tweet);
});

function generateGif(tweet){
	var id = tweet.id;
	var text = tweet.text;
	var screen_name = tweet.user.screen_name;
	var query = text.substring(text.indexOf(username) + username.length + 1);
	giphy.search(query, function(err, res){
		var image = res.data[0].images;
		if( image != undefined){
			var options = {string: true};

			base64.encode(image.fixed_height.url,options, function(err,image){

				t.post('media/upload', { media_data: image }, function (err, data, response) {
					

				  var mediaIdStr = data.media_id_string
				  var params = { status: "@" + tweet.user.screen_name + ". Have fun (*^▽^*)", in_reply_to_status_id: tweet.id_str, media_ids: [mediaIdStr] }

				  t.post('statuses/update', params, function (err, data, response) {	
				  	console.log("tweet had been sent to " + tweet.user.screen_name);
				  })
				})
			})
		}
	});
};

