"use strict";

function chromeCast() {
	var Client = require('castv2-client').Client;
	var DefaultMediaReceiver = require('castv2-client').DefaultMediaReceiver;
	var mdns = require('mdns');
  var Q = require('q');

	var client = new Client();
	var player, playerPromise, chromeCastIP, channel;

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
			playerPromise.promise.then(() => {
				res.status(200).send('Playback Started');
			}).catch((err) => {
				res.status(500).send('Playback Failed: ', err);
			}).progress((progress) => {
			    console.log('status broadcast playerState=%s', progress.playerState);
			});

		}
	}

	/**
	 * Stops playback
	 */
	this.stop = function(req, res) {
		if(player) {
			player.stop();
			player.close();
			res.status(200).send('Playback Stopped');
		} else {
			res.status(500).send('Player_not_found');
		}
	}

	/**
	 * @return {Promise} - Promise containing the IP address of the first Chromecast found on your network
	 */
	function findChromecast() {
		return new Promise(function(resolve, reject) {
			var browser = createBrowser();
			browser.start();

			browser.on('serviceUp', function(service) {
				if (service.name === 'Chromecast-ad1f30f7025d01768776e9a38e50f219') {
					resolve(service.addresses[0]);
				}
				browser.stop();
			});

			browser.on('error', reject);
			browser.on('serviceDown', reject);

			setTimeout(function() {
				reject("Timeout");
			}, 30000);
		});
	}

	/**
	 * @return {Object} MDNS Browser Instance
	 */
	function createBrowser() {
		var sequence = [
			mdns.rst.DNSServiceResolve(),
			'DNSServiceGetAddrInfo' in mdns.dns_sd ? mdns.rst.DNSServiceGetAddrInfo() : mdns.rst.getaddrinfo({families:[4]}),
			mdns.rst.makeAddressesUnique()
		];
		return mdns.createBrowser(mdns.tcp('googlecast'), {resolverSequence: sequence});
	}

	/**
	 * @param  {string} host - IP Address of the chromecast
	 * @return {Promise} - Promise indicating the status of the Chromecast playback
	 */
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

	/**
	 * Loads a video on the passed playInstance returned from goCast
	 */
	function playVideo(err, playerInstance) {
		player = playerInstance;
		var apiLocation = process.env.API_LOCATION;
		var pathToMovie = apiLocation + '/tv/'+ channel;

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
			playerPromise.notify(status);
		});

		player.load(media, { autoplay: true }, onPlay);
	}

	/**
	 * Callback once Chromecast starts playing, used to resolve playerPromise
	 */
	function onPlay(err, status) {
		if(err) {
			console.log("Error:",err);
			return playerPromise.reject(err);
		}
		playerPromise.resolve(status);
	}
}

module.exports = chromeCast;
