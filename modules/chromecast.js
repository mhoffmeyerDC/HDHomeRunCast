"use strict";

function chromeCast() {
	var Client                = require('castv2-client').Client;
	var DefaultMediaReceiver  = require('castv2-client').DefaultMediaReceiver;
	var mdns                  = require('mdns');
    var Q                     = require('q');
    
	var channel 			  = 804; //N-B-C
    
	var client = new Client();
	var player = null;
	var playerPromise = null;
	var chromeCastIP = null;

	findChromecast().then(function(ip) {
		chromeCastIP = ip;
	});

	this.cast = function(req, res) {
		if(!chromeCastIP) {
			findChromecast().then((ip) => {
				chromeCastIP = ip;
				this.cast(req, res);
			});
		} else {
			channel = req.params.channel;
			playerPromise = goCast(chromeCastIP);
			playerPromise.promise.then(function() {
				res.status(200).send('Playback Started');
				var request = require('request');
				setTimeout(function() {
					console.log("Pausing?");
					request('http://192.168.0.74:4000/pause');
					setTimeout(function() { 
					request('http://192.168.0.74:4000/resume');

				}, 5000);

				}, 500);
			}).catch(() => {
				res.status(500).send('Playback Failed');
			}).progress(function (progress) {
			    // We get notified of the upload's progress
			});

		}
	}

	this.stop = function(req, res) {
		if(player) {
			player.stop();
			player.close();
			res.status(200).send('Playback Stopped');
		} else {
			res.status(500).send('Player_not_found');
		}
	}

	this.pause = function(req, res) {
		if(player) {

		}
	}

	function findChromecast() {
		return new Promise( function (resolve, reject) {
			var browser = createBrowser();
			browser.start();

			browser.on('serviceUp', function (service) {
			  	resolve(service.addresses[0]);
			  	browser.stop();
			});

			browser.on('error', reject);
			browser.on('serviceDown', reject);

			setTimeout(function() {
				reject("Timeout");
			}, 30000);
		});
	}

	function createBrowser() {
		var sequence = [
			mdns.rst.DNSServiceResolve(),
			'DNSServiceGetAddrInfo' in mdns.dns_sd ? mdns.rst.DNSServiceGetAddrInfo() : mdns.rst.getaddrinfo({families:[4]}),
			mdns.rst.makeAddressesUnique()
		];
		return mdns.createBrowser(mdns.tcp('googlecast'), {resolverSequence: sequence});
	}

	function goCast(host) {
        var deferred = Q.defer();
           client.connect(host, function onChromecastConnect() {
				client.launch(DefaultMediaReceiver, playVideo);
			});

			client.on('error', function onChromecastError(err) {
				deferred.reject(err);
				client.close();
			});
            
        return deferred;
	}

	function playVideo(err, playerInstance) {
		player = playerInstance;
		var apiLocation = process.env.API_LOCATION;
		var pathToMovie = apiLocation + '/cable/'+ channel;
		var media = {
			contentId:  pathToMovie,
			contentType: 'video/mp4',
			streamType: 'BUFFERED',
			metadata: {
				type: 0,
				metadataType: 0,
				title: "Channel" + channel,
				images: []
			}
		};

		player.on('status', function(status) {
			console.log('status broadcast playerState=%s', status.playerState);
			playerPromise.notify(err);
		});

		player.load(media, { autoplay: true }, onPlay);
	}

	function onPlay(err, status) {
		if(err) {
			console.log("Error:",err);
			return playerPromise.reject(err);
		}
		playerPromise.resolve(status);	
	}
}

module.exports = chromeCast;
