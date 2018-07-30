//-------------------------->
// Discord Bot #SnoopyBot
//-------------------------->
// Developed by Alex Hernandez
// a.k.a. snoopy © 2017
//-------------------------->
// -> Requirements
const _discord 	= require("discord.js");
const _fs 		= require("fs");
const _ytdl 	= require("ytdl-core");
const _request 	= require("request");
const _getytid	= require("get-youtube-id");	
const _fetchvid = require("youtube-info");
const _moment = require("moment");
const Enmap = require('enmap');
const EnmapLevel = require('enmap-level');
//-------------------------->
// -> Bot Handling
const bot 		= new _discord.Client({ autoReconnect: true });
var   package 	= JSON.parse(_fs.readFileSync('./package.json', 'utf-8'));
var   config 	= JSON.parse(_fs.readFileSync('./settings.json', 'utf-8'));
bot.settings = new Enmap({name: 'settingsmodlogs', persistent: true});
const autoreply = {
	dm_text: 		"Hi there! I currently don't have any functionality with direct messages.",
	mention_text: 	"Use **" + config.handles.prefix + "commands** to see my commands list."
}
//-------------------------->
// -> Music Handling
var servers = { };
//-------------------------->
// -> Command Handling
var commands = [

	
	// -> Commands
	{
		command: "help",
		command_aliases: ["cmds","cmd","commands","command","commandlist"],
		description: "Displays this message",
		args: ["_page"],
		admin: false,
		exec: function(message, params)
		{
			var reqPageExists = true;
			var totalPages = Math.ceil(commands.length / config.handles.page_limit);
			var currentPage = 1; // Default

			// > Currently showing pages
			var cmdsStartId = -1;
			var cmdsEndId = -1;

			// > Fix total
			if((commands.length / config.handles.page_limit) < 1)
				totalPages = 1;

			// > Are we requesting a page?
			if(params.length > 0)
			{
				// > Get requested page
				var reqPageId = parseInt(params[0]);

				// > Check page exists
				if(reqPageId > totalPages)
				{
					reqPageExists = false;
					message.reply(":x: That page does not exist. The pages range from 1 to " + totalPages);
				}
				else
				{
					// > Page exists, so set it
					currentPage = reqPageId;

					// > Set our start and end points
					cmdsStartId = (config.handles.page_limit * (currentPage-1));
					cmdsEndId = (config.handles.page_limit * currentPage);

					// > Fix our end id
					if(cmdsEndId > commands.length) cmdsEndId = commands.length;
				}
			}
			else
			{
				// > Default page (1)
				reqPageExists = true;
				currentPage = 1;
				cmdsStartId = 0;
				cmdsEndId = config.handles.page_limit;
			}

			// > Display our commands
			if(reqPageExists)
			{
				// > Setup our embed response
				const embed = new _discord.RichEmbed()
				.setTitle("Commands")
				.setAuthor(config.handles.title, config.handles.icon_url)
				.setColor(0x00AE86)
				.setDescription("**[args]** are optional, **<args>** are required.")
				.setThumbnail(config.handles.icon_url);

				// > Hold data
				var item_count = 0;

				// > Loop through our commands
				for(var i = cmdsStartId; (i < cmdsEndId); i++)
				{
					// > Check that we're not stepping over our array length
					if(i >= commands.length)
						break;

					// > Variables
					var c = commands[i];
					var arg_list = "";
					var cmd_alias_list = "";

					for(var j = 0; j < c.args.length; j++)
					{
						if(c.args[j].includes("_"))
							arg_list += "[" + c.args[j].substring(1) + "] ";
						else
							arg_list += "<" + c.args[j] + "> ";
					}

					cmd_alias_list = "Aliases: _";
					if(c.command_aliases.length == 0) 
						cmd_alias_list += "none_";
					else
					{
						for(var k = 0; k < c.command_aliases.length; k++)
						{
							if((k+1) >= c.command_aliases.length)
								cmd_alias_list += config.handles.prefix + c.command_aliases[k];
							else
								cmd_alias_list += config.handles.prefix + c.command_aliases[k] + ", ";
						}
						cmd_alias_list += "_";
					}
					embed.addField("**" + config.handles.prefix + c.command + "** " + arg_list, c.description + "\n" + cmd_alias_list);
					item_count += 1;
				}
				embed.setFooter(`Listing ${item_count} command(s) - Page [${currentPage}/${totalPages}] - Developed by ${package.author} - Version ${package.version}`, config.handles.icon_url);

				message.reply({embed}).catch(console.error);

			}
		},
	},
	
	// -> Uptime
	{
		command: "uptime",
		command_aliases: [],
		description: "Shows how long I've been up for!",
		args: [],
		admin: false,
		exec: function(message, params)
		{
				String.prototype.toHHMMSS = function () {
						var sec_num = parseInt(this, 10); 
						var hours   = Math.floor(sec_num / 3600);
						var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
						var seconds = sec_num - (hours * 3600) - (minutes * 60);
				
						if (hours   < 10) {hours   = "0"+hours;}
						if (minutes < 10) {minutes = "0"+minutes;}
						if (seconds < 10) {seconds = "0"+seconds;}
						var time    = "**"+hours+ '** Hours ,**' +minutes+ '** Minutes ,**' +seconds+ ' **seconds';
						return time;
				}
						var time = process.uptime();
						var uptime = (time + "").toHHMMSS();
						const embed = new _discord.RichEmbed()
							.setTitle("Uptime!")
							.setAuthor(config.handles.title)
							.setColor(0x00AE86)
							.setDescription("Retrieved how long I've been up for.")
							.addField(`I've been up for`, `${uptime}`)
							.setFooter(`Developed by ${package.author} - Version ${package.version}`, config.handles.icon_url);
						message.channel.send({embed});
				
	}
	
},

	// -> Ping
	{
		command: "ping",
		command_aliases: [],
		description: "Calculate ping between sending and receiving messages.",
		args: [],
		admin: true,
		exec: function(message, params)
		{
			message.channel.send("Pinging...").then(m =>
			{
				// -> Variables
				var lat_ms = (m.createdTimestamp - message.createdTimestamp);
				var api_ms = (Math.round(bot.ping));

				m.delete().then().catch(console.error);

				const embed = new _discord.RichEmbed()
					.setTitle("Pong!")
					.setAuthor(config.handles.title)
					.setColor(0x00AE86)
					.setDescription("Retrieved current ping/pong latency tests and Discord API latency.")
					.addField("Latency", lat_ms + "ms", true)
					.addField("API", api_ms + "ms", true)
					.setFooter(`Developed by ${package.author} - Version ${package.version}`, config.handles.icon_url);
				message.channel.send({embed});
			}).catch(console.error);
		},
	},

	// -> Play Song
	{
		command: "play",
		command_aliases: ["p"],
		description: "Search for the request song and queue it",
		args: ["url / search query"],
		admin: false,
		exec: async function(message, params)
		{
			// > Check that the member is currently in a voice channel
			if(!message.member.voiceChannel) { message.reply("Please join a voice channel first!"); return; }

			// > Does our server have a music vars setup?
			if(!servers[message.guild.id])
				handleMusic_Setup(message.guild.id);

			// > Find our server and handle our requst
			var server = servers[message.guild.id];

			// > Check to see if we're handling a playlist
			var _msg = message.content;
			if(_msg.match(/(?:[?&]list=|\/embed\/|\/1\/|\/v\/|https:\/\/(?:www\.)?youtu\.be\/)([^&\n?#]+)/))
			{
				var playlistId = _msg.match(/(?:[?&]list=|\/embed\/|\/1\/|\/v\/|https:\/\/(?:www\.)?youtu\.be\/)([^&\n?#]+)/)[1];
				message.reply("I'm still working on this! (Playlist ID: " + playlistId + ")");
			}


			// > Send query message
			message.channel.send(":mag_right: Searching for `" + params.join(" ") + "`...").then((msg) => { setTimeout(() => { msg.delete() }, 1750); }).catch(console.error);

			// > New request
			if(server.queue.length > 0 || server.isPlaying)
			{
				console.log("[MUSIC!]: " + server.queue.length.toString() + " in queue, play state: " + (server.isPlaying ? "playing" : "not playing"));
				handleMusic_GetID(params, (id) =>
				{
					console.log("[MUSIC!]: Video ID reply: " + id);
					if(id == "null")
						message.channel.send(":x: Unable to find a song with the title **" + params.join(" ") + "**.");
					else
					{
						handleMusic_AddToQueue(id, message.author.username, message.guild.id);
						_fetchvid(id, (err, videoInfo) =>
						{
							if(err) throw new Error(err);

							// > Setup our embed response
							const embed = new _discord.RichEmbed()
							.setTitle("Added To Queue")
							.setAuthor("Added To Queue - " + config.handles.title, config.handles.icon_url, videoInfo.url)
							.setColor(0x00AE86)
							.setThumbnail(videoInfo.thumbnailUrl)
							.setDescription(videoInfo.title)
							.addField("Channel", videoInfo.owner, true)
							.addField("Length", timeString(videoInfo.duration), true)
							.addField("Requested by", message.author.username, true)
							.addField("Queue Position", server.queue.length, true)
							.setFooter(`Developed by ${package.author} - Version ${package.version}`, config.handles.icon_url);

							var queueData = { title: null, length: null, link: null, requester: null };
							queueData.title = videoInfo.title;
							queueData.length = timeString(videoInfo.duration);
							queueData.link = videoInfo.url;
							queueData.requester = message.author.username;
							server.queueInfo.push(queueData);

							message.channel.send({embed});
						});
					}
				});
			}
			else
			{
				console.log("[MUSIC!]: Queue is empty, play state: " + (server.isPlaying ? "playing" : "not playing"));
				handleMusic_GetID(params, (id) =>
				{
					console.log("[MUSIC!]: Video ID reply: " + id);
					if(id == "null")
						message.channel.send(":x: Unable to find a song with the title **" + params.join(" ") + "**.");
					else
					{
						server.queue.push(id);
						server.isPlaying = true;

						_fetchvid(id, (err, videoInfo) =>
						{
							if(err) throw new Error(err);

							// > Setup our embed response
							const embed = new _discord.RichEmbed()
							.setTitle("Now Playing")
							.setAuthor("Now Playing - " + config.handles.title, config.handles.icon_url, videoInfo.url)
							.setColor(0x00AE86)
							.setThumbnail(videoInfo.thumbnailUrl)
							.setDescription(videoInfo.title)
							.addField("Channel", videoInfo.owner, true)
							.addField("Length", timeString(videoInfo.duration), true)
							.addField("Requested by", message.author.username, true)
							.addField("Queue Position", "-", true)
							.setFooter(`Developed by ${package.author} - Version ${package.version}`, config.handles.icon_url);

							var queueData = { title: null, length: null, link: null, requester: null };
							queueData.title = videoInfo.title;
							queueData.length = timeString(videoInfo.duration);
							queueData.link = videoInfo.url;
							queueData.requester = message.author.username;
							server.currentSong.requester = queueData.requester;
							server.queueInfo.push(queueData);

							message.channel.send({embed});
						});

						// > Join the channel and play the requested song
						message.member.voiceChannel.join().then((connection) => 
						{
							handleMusic_Play(connection, message);
						})
						.catch((err) =>
						{
							console.log(err);
						});
					}
				});
			}
		}
	},

	// -> Skip Song
	{
		command: "skip",
		command_aliases: ["s", "next"],
		description: "Vote to skip the current playing song",
		args: [],
		admin: false,
		exec: function(message, params)
		{
			// > Does our server have a music vars setup?
			if(!servers[message.guild.id])
				handleMusic_Setup(message.guild.id);

			// > Check if message author is in the same channel as the bot


			var server = servers[message.guild.id];
			if(server.dispatcher)
			{
				if(server.isPlaying && server.queue.length >= 1)
				{
					message.channel.send(":musical_note: :arrow_right: Skipped _**" + server.currentSong.title + "_**!");
					server.dispatcher.end();
				}
				else
				{
					if (!server.isPlaying && server.queue.length < 1)
						message.channel.send(":x: There are no songs playing and there are no more songs to skip to.");
					else if(!server.isPlaying)
						message.channel.send(":x: There are no songs playing!");
					else if(server.queue.length < 1)
						message.channel.send(":x: There are no more songs to skip to.");
					else
						message.channel.send(":x: Unable to skip song.");
				}
			}
			else message.channel.send(":x: Unable to skip song.");
		}
	},

	// -> Stop Song
	{
		command: "stop",
		command_aliases: [],
		description: "Clear the queue and stop playing music",
		args: [],
		admin: false,
		exec: function(message, params)
		{
			// > Does our server have a music vars setup?
			if(!servers[message.guild.id])
				handleMusic_Setup(message.guild.id);

			var server = servers[message.guild.id];
			if(server.dispatcher)
			{
				// > Clear the queue
				server.queue = [];
				server.skipReqs = 0;
				server.skippers = [];
				server.dispatcher.end();
				server.isPlaying = false;
				message.channel.send(":stop_button: Stopped all music!");
			}
			else message.channel.send(":x: Unable to stop all music.");
		}
	},

	// -> Set Volume
	{
		command: "volume",
		command_aliases: ["vol","v"],
		description: "Set the volume of the bot (1-100)",
		args: ["_volume"],
		admin: true,
		exec: function(message, params)
		{
			// > Does our server have a music vars setup?
			if(!servers[message.guild.id])
				handleMusic_Setup(message.guild.id);

			var server = servers[message.guild.id];
			if(server.dispatcher)
			{
				var vol = params[0];
				if(vol >= 1 && vol <= 100)
				{
					server.dispatcher.setVolume(vol / 100);
					message.channel.send(":loud_sound: Set volume to: " + vol);
				}
				else message.channel.send(":loud_sound: The current volume is: " + (server.dispatcher.volume * 100));
			}
			else message.channel.send(":x: Unable to modify volume.");
		}
	},

	// -> Queue
	{
		command: "queue",
		command_aliases: ["q", "que", "playlist"],
		description: "Get the current queue",
		args: ["_page"],
		admin: false,
		exec: function(message, params)
		{
			// > Does our server have a music vars setup?
			if(!servers[message.guild.id])
				handleMusic_Setup(message.guild.id);

			var server = servers[message.guild.id];
			var reqPageExists = true;
			var totalPages = Math.ceil(server.queueInfo.length / config.handles.page_limit);
			var currentPage = 1; // Default

			// > Currently showing pages
			var cmdsStartId = -1;
			var cmdsEndId = -1;

			// > Fix total
			if((server.queueInfo.length / config.handles.page_limit) < 1)
				totalPages = 1;

			// > Are we requesting a page?
			if(params.length > 0)
			{
				// > Get requested page
				var reqPageId = parseInt(params[0]);

				// > Check page exists
				if(reqPageId > totalPages)
				{
					reqPageExists = false;
					message.channel.send(":x: That page does not exist. The pages range from 1 to " + totalPages + ".");
				}
				else
				{
					// > Page exists, so set it
					currentPage = reqPageId;

					// > Set our start and end points
					cmdsStartId = (config.handles.page_limit * (currentPage-1));
					cmdsEndId = (config.handles.page_limit * currentPage);

					// > Fix our end id
					if(cmdsEndId > server.queueInfo.length) cmdsEndId = server.queueInfo.length;
				}
			}
			else
			{
				// > Default page (1)
				reqPageExists = true;
				currentPage = 1;
				cmdsStartId = 0;
				cmdsEndId = config.handles.page_limit;
			}



			// > Display our commands
			if(reqPageExists)
			{
				// > Setup our embed response
				const embed = new _discord.RichEmbed()
				.setAuthor("Queue - " + config.handles.title, config.handles.icon_url)
				.setColor(0x00AE86)
				.setThumbnail(config.handles.icon_url);

				// > Hold data
				var item_count = 0;

				// > Loop through our commands
				for(var i = cmdsStartId; (i < cmdsEndId); i++)
				{
					// > Check that we're not stepping over our array length
					if(i >= server.queueInfo.length)
						break;

					// > Variables
					var tune = server.queueInfo[i];
					embed.addField("**" + tune.title + "**", "Length: " + tune.length + " - Requested By: " + tune.requester);

					// > Increment data
					item_count += 1;
				}
				embed.setFooter(`Listing ${item_count} song(s) - Page [${currentPage}/${totalPages}] - Developed by ${package.author} - Version ${package.version}`, config.handles.icon_url);

				if(item_count > 0)
					message.channel.send({embed});
				else
					message.channel.send(":x: The queue is empty! Add a song by typing **" + config.handles.prefix + "play _<title / url>**");
			}
		}
	},

	// -> Now Playing
	{
		command: "nowplaying",
		command_aliases: ["np", "now", "cursong", "currentsong", "playing"],
		description: "Gets the currently playing song",
		args: [],
		admin: false,
		exec: function(message, params)
		{
			// > Does our server have a music vars setup?
			if(!servers[message.guild.id])
				handleMusic_Setup(message.guild.id);

			var server = servers[message.guild.id];
			if(!server.isPlaying) message.channel.send(":x: :musical_note: There is no song currently playing!");
			else
			{
				// > Setup our embed response
				const embed = new _discord.RichEmbed()
				.setTitle("Now Playing")
				.setAuthor("Now Playing - " + config.handles.title, config.handles.icon_url, server.currentSong.link)
				.setColor(0x00AE86)
				.setThumbnail(server.currentSong.thumbnail)
				.setDescription(server.currentSong.title)
				.addField("Current Time", (timeString(server.dispatcher.time / 1000)) + " / " + server.currentSong.length, true)
				.addField("Requested by", server.currentSong.requester, true)
				.addField("Family Friendly", server.currentSong.familyfriendly ? "Yes" : "No",true);

				message.channel.send({embed});
			}
		}
	},

	// -> Pause
	{
		command: "pause",
		command_aliases: [],
		description: "Pause the current song",
		args: [],
		admin: false,
		exec: function(message, params)
		{
			// > Does our server have a music vars setup?
			if(!servers[message.guild.id])
				handleMusic_Setup(message.guild.id);

			// > Pause
			var server = servers[message.guild.id];
			if(!server.isPaused && server.dispatcher)
			{
				server.isPaused = true;
				server.dispatcher.pause();
				message.channel.send(":musical_note: :pause_button: Paused!");
			}
			else message.channel.send(":x: Unable to pause music.");
		}
	},

	// -> Unpause
	{
		command: "unpause",
		command_aliases: ["resume"],
		description: "Unpause the current song",
		args: [],
		admin: false,
		exec: function(message, params)
		{
			// > Does our server have a music vars setup?
			if(!servers[message.guild.id])
				handleMusic_Setup(message.guild.id);

			// > Unpause
			var server = servers[message.guild.id];
			if(server.isPaused && server.dispatcher)
			{
				server.isPaused = false;
				server.dispatcher.resume();
				message.channel.send(":musical_note: :arrow_forward: Resumed!");
			}
			else message.channel.send(":x: Unable to resume music.");
		}
	},

	// -> Server Information
	{
		command: "serverinfo",
		command_aliases: ["servinfo"],
		description: "Get some information about the server",
		args: [],
		admin: false,
		exec: function(message, params)
		{
			let botRole = bot.guilds.get(message.guild.id).members.get(bot.user.id).roles.find(role => !role.name.includes("everyone"));
			let id = message.guild.id;
			let name = message.guild.name;
			let owner = message.guild.owner.user.tag;
			let region = message.guild.region;
			let channelsCount = message.guild.channels.size;
			let rolesCount = message.guild.roles.size - 1; // no need to count for '@everyone'
			let membersCount = message.guild.memberCount - 1;
			let botCount = botRole.members.size;
			let humansCount = membersCount - botCount;

			var embed = new _discord.RichEmbed()
			.setAuthor("Server Info - " + config.handles.title, config.handles.icon_url)
			.addField("ID", id, true)
			.addField("Name", name, true)
			.addField("Owner", owner, true)
			.addField("Region", region, true)
			.addField("Channels", channelsCount, true)
			.addField("Roles", rolesCount, true)
			.addField("Members", humansCount, true)
			.addField("Bots", botCount, true)
			.setColor(0x00AE86)
			.setThumbnail(config.handles.icon_url)
			.setTimestamp()
			.setFooter(`Developed by ${package.author} - Version ${package.version}`, config.handles.icon_url);
			message.channel.send({embed});
		}
	},

	// -> Bot Information
	{
		command: "info",
		command_aliases: ["about"],
		description: "Get some information about the bot",
		args: [],
		admin: false,
		exec: function(message, params)
		{
			var embed = new _discord.RichEmbed()
			.setAuthor("Server Info - " + config.handles.title, config.handles.icon_url)
			.setDescription("Hi! I'm a bot created by snoopy#6927. I have a variety of features which you can find by typing **-cmds** into any channel.\n\n**Developer Information:**\nI'm a 14 year old developer studying Computer Science. I usually code only for fun.")
			.setColor(0x00AE86)
			.setThumbnail(config.handles.icon_url)
			.setTimestamp()
			.setFooter(`Developed by ${package.author} - Version ${package.version}`, config.handles.icon_url);
			message.channel.send({embed});
		}
	},

		// -> coinflip
		{
			command: "coinflip",
			command_aliases: [],
			description: "Flips a coin!",
			args: [],
			admin: false,
			exec: function(message, params)
			{
				var textArray = [
					"heads!",
					"tails!"
					];
						var hi = Math.floor(Math.random()*textArray.length);
						var embed = new _discord.RichEmbed()
						.setAuthor("Coin Flip - " + config.handles.title, config.handles.icon_url)
						.addField("Coin Flipped:", "And you landed  🔛   " + textArray[hi], true)
						.setColor(0x700a0a)
						.setThumbnail(config.handles.icon_url)
						.setTimestamp()
						.setFooter(`Developed by ${package.author} - Version ${package.version}`, config.handles.icon_url);
						message.reply({embed});
			}
		},

		// => Get Avatar
		{
			command: "avatar",
			command_aliases: [],
			description: "Gets Mentioned Users Profile Picture",
			args: ["_user"],
			admin: false,
			exec: function(message, params)
			{
				// > Variables
				const user = message.mentions.users.first();
				// Message Author Avatar
				var embed2 = new _discord.RichEmbed()
				.setAuthor("Avatar - " + config.handles.title, config.handles.icon_url)
				.addField("Username:", message.author.tag, true)
				.addField("Your Avatar:", message.author.avatarURL)
				.setColor(0x00AE86)
				.setThumbnail(config.handles.icon_url)
				.setTimestamp()
				.setFooter(`Developed by ${package.author} - Version ${package.version}`, config.handles.icon_url);
				// > Actual Code
				if(!user) message.channel.send(embed2); // If they didn't @ someone
				else
				{
				var embed = new _discord.RichEmbed()
				.setAuthor("Avatar - " + config.handles.title, config.handles.icon_url)
				.addField("Username:", user.tag, true)
				.addField("Avatar URL:", user.displayAvatarURL, true)
				.setColor(0x00AE86)
				.setThumbnail(config.handles.icon_url)
				.setTimestamp()
				.setFooter(`Developed by ${package.author} - Version ${package.version}`, config.handles.icon_url);
				message.channel.send(embed)
				}
			}
		},

		// -> User Information
		{
			command: "userinfo",
			command_aliases: ["profile"],
			description: "Get information about a specific user",
			args: ["_user"],
			admin: false,
			exec: function(message, params)
			{
				// > Variables
				let mentioned = message.mentions.members.first();
				const mention = message.mentions.users.first();
				const status = {
					online: 'Online',
					idle: 'Idle',
					dnd: 'Do Not Disturb',
					offline: 'Offline/Invisible'
				};
				// > if they didn't @ someone
				var embed2 = new _discord.RichEmbed()
				.setAuthor("User Info - " + config.handles.title, config.handles.icon_url)
				.addField("Username:", message.author.username, true)
				.addField("User Discriminator:", `#${message.author.discriminator}`, true)
				.addField("User ID:", message.author.id, true)
				.addField("Playing:", `${message.author.presence.game === null ? "No Game" : message.author.presence.game.name}`)
				.addField("Account Created:", message.author.createdAt, true)
				.addField("Status:", `${status[message.author.presence.status]}`)
				.setColor(0x00AE86)
				.setThumbnail(config.handles.icon_url)
				.setTimestamp()
				.setFooter(`Developed by ${package.author} - Version ${package.version}`, config.handles.icon_url);
				if(!mention) message.channel.send(embed2); // If they didn't @ someone
				// > Actual Code
				else
				{
				var embed = new _discord.RichEmbed()
				.setAuthor("User Info - " + config.handles.title, config.handles.icon_url)
				.addField("Username:", mention.username, true)
				.addField("User Discriminator:", `#${mention.discriminator}`, true)
				.addField("User ID:", mention.id, true)
				.addField("Playing:", `${mention.presence.game === null ? "No Game" : mention.presence.game.name}`)
				.addField("Account Created:", mention.createdAt, true)
				.addField("Status:", `${status[mention.presence.status]}`)
				.setColor(0x00AE86)
				.setThumbnail(config.handles.icon_url)
				.setTimestamp()
				.setFooter(`Developed by ${package.author} - Version ${package.version}`, config.handles.icon_url);
				message.channel.send({embed});
				}
			}
		},

	// -> Clean
	{
		command: "purge",
		command_aliases: ["clear", "clean", "delete", "del"],
		description: "Purge _x_ amount of messages [from user]",
		args: ["_user", "count"],
		admin: true,
		exec: function(message, params)
		{
			// > Variables
			const user = message.mentions.users.first();
			var _amount = 0;

			// > Specify amount
			if(params.length == 2)
				_amount = parseInt(params[1]);
			else if(params.length == 1)
				_amount = parseInt(params[0]);
			else
			{
				message.channel.send("Invalid purge command.").then((m) => { setTimeout(() => { m.delete(); }, 2500); }).catch(console.error);
				return;
			}

			// > Reset variable
			const amount = (_amount == 100 ? 100 : _amount + 1);

			// > Purge
			message.channel.fetchMessages({ limit: amount }).then((messages) =>
			{
				if(user)
				{
					const filterBy = user ? user.id : bot.user.id;
					messages = messages.filter(m => m.author.id === filterBy).array().slice(0, amount);
				}
				message.channel.bulkDelete(messages).catch(error => console.log(error.stack));
			});

			// > Send deletion message
			message.channel.send(`:fingers_crossed: ${(amount-1)} message(s) deleted!`).then((m) => { setTimeout(() => { m.delete(); }, 5000); }).catch("[Snoopy] Message already deleted.");
		}

	},
	// -> roll
	{
		command: "roll",
		command_aliases: [],
		description: "Rolls a random Number!",
		args: [],
		admin: false,
		exec: function(message, params)
		{
			var roll = Math.floor(Math.random() * 30) + 1;
			var embed = new _discord.RichEmbed()
			.setAuthor("Rolled Number - " + config.handles.title, config.handles.icon_url)
			.addField("Roll:", "🎲 You rolled a " + roll, true)
			.setColor(0x700a0a)
			.setThumbnail(config.handles.icon_url)
			.setTimestamp()
			.setFooter(`Developed by ${package.author} - Version ${package.version}`, config.handles.icon_url);
			message.reply({embed});
		}
	},	
	// -> ModLog
	{
		command: "modlog",
		command_aliases: [],
		description: "Sets where the bot should log everything",
		args: [],
		admin: false,
		exec: function(message, params)
		{
			const thisConf = bot.settings.get(message.guild.id);
			thisConf.modLogChannel = `${message.channel.name}`;
			
			bot.settings.set(message.guild.id, thisConf);
			var embed = new _discord.RichEmbed()
			.setAuthor("Mod Log - " + config.handles.title, config.handles.icon_url)
			.addField("Successfully set Log Channel:", `The set channel is now ${thisConf.modLogChannel}`)
			.setColor(0x700a0a)
			.setThumbnail(config.handles.icon_url)
			.setTimestamp()
			.setFooter(`Developed by ${package.author} - Version ${package.version}`, config.handles.icon_url);
			message.channel.send({ embed: embed })
		}
	},
	// -> Prefix
	{
		command: "prefix",
		command_aliases: ["setprefix"],
		description: "Set prefix",
		args: ["newprefix"],
		admin: true,
		exec: function(message, params)
		{

			// > New prefix
			let newPrefix = params[0];

			// > Update prefix
			if(newPrefix == "" || newPrefix == null || newPrefix == undefined)
				message.channel.send("You must define a new prefix.");
			else
			{
				config.handles.prefix = newPrefix;
				_fs.writeFile("./settings.json", JSON.stringify(config, null, 4), (err) => console.error);
				message.channel.send(":white_check_mark: Prefix updated to **" + config.handles.prefix + "**");
			}
			}
	}
	
];
//-------------------------->
// -> Handlers
bot.on("message", message => 
{
	// > Ignore messages which we don't need to process
    if(message.author.bot)
		return;

		if (message.channel.type == "dm") {
			var msg = message.content;
			var msgAuthor = message.author.tag;

			var embed2 = new _discord.RichEmbed()
				.addField("You tried to break me!", "And I really don't appreciate you trying to break me :cry: \nI have informed my Creator about this message.")
				.setFooter("If you believe this command should be allowed to be accessed in DMs Please message my Developer @ snoop#6927")
				.setColor(0x00AE86)
				 message.channel.send(embed2)
			var embed27 = new _discord.RichEmbed()
				 .addField("Who tried to break me?", message.author.tag +  " Has attempted to break me")
				 .setTimestamp()
				 .setColor(0x00AE28)
				 bot.users.get('265279363199533068').send(embed27);
				 console.log(msgAuthor + " tried to send " + msg + " , in a DM, basically he tried to break the bot");
			 return;
				 };

	if (bot.user.id === message.author.id) { return }
	
    if(message.channel.type === "text")
	{
		if(message.isMentioned(bot.user) && message.content.indexOf(config.handles.prefix) !== 0)
			message.reply(autoreply.mention_text);
		else
		{
			var msg = message.content;
			var msgAuthor = message.author.tag;
			if(msg.indexOf(config.handles.prefix) === 0)
			{
				console.log("[Snoopy] Handling command query: '" + msg + "' Author: '" + msgAuthor + "'");
				handleCommand(message, msg);
			}
		}
	}
	
});

bot.on("guildCreate", guild => {
	const channel3 = guild.channels.find('name', 'general');
	
	var embed2 = new _discord.RichEmbed()
	.setAuthor("Thanks For Inviting Me! - " + config.handles.title, config.handles.icon_url)
	.addField("Information:", "Hello there!\nThanks for inviting me to your server! Here are a few thing to get started! \nFirstly, To see all of my commands do **-help [pageNumber]** (IN A CHANNEL)\nAnd I well that's everything you need to know me :thinking: Enjoy!", true)
	.setColor(0x700a0a)
	.setThumbnail(config.handles.icon_url)
	.setTimestamp()
	.setFooter(`Developed by ${package.author} - Version ${package.version}`, config.handles.icon_url);

  if (!channel3) return guild.owner.send(embed2)
	
	var embed = new _discord.RichEmbed()
	.setAuthor("Thanks For Inviting Me! - " + config.handles.title, config.handles.icon_url)
	.addField("Information:", "Hello there!\nThanks for inviting me to your server! Here are a few thing to get started! \nFirstly, To see all of my commands do **-help [pageNumber]** (IN A CHANNEL)\nAnd I well that's everything you need to know me :thinking: Enjoy!", true)
	.setColor(0x700a0a)
	.setThumbnail(config.handles.icon_url)
	.setTimestamp()
	.setFooter(`Developed by ${package.author} - Version ${package.version}`, config.handles.icon_url);
	
	channel3.send(embed)
guild.createChannel('welcome', 'text')
  .then(channel => console.log(`Created new channel ${channel}`))
  .catch(console.error);
});

const defaultSettings = {
  modLogChannel: "mod-log"
}

bot.on("message", (message) => {
  if (message.content === "Snoopy Find The Log Channel") {
    const thisConf = bot.settings.get(message.guild.id);
      const channel = message.guild.channels.find('name', `${thisConf.modLogChannel}`);
if (!channel) message.reply("No channel found");
channel.send("I found the log channel!");
	}});
	
	bot.on("messageDelete", (message) => {
		const thisConf = bot.settings.get(message.guild.id);
		const channel = message.guild.channels.find('name', `${thisConf.modLogChannel}`);
		if (!channel) return;
		var embed = new _discord.RichEmbed()
		.setTitle("Message Deleted - " + config.handles.title)
		.setColor(0x00AE28)
		.setThumbnail("https://cdn0.iconfinder.com/data/icons/office-and-job-1/100/007-98-128.png")
		.setDescription(`${message.author.tag} has deleted this message:`, `${message}`)
		channel.send({embed})
	});

bot.on('ready', (message) => {
	bot.user.setUsername("Snoopy");
	console.log("---------------Bot info--------------");
    console.log(`Bot name: ${bot.user.username}`);
    console.log(`Servers: ${bot.guilds.size}`);
    console.log(`Users: ${bot.users.size}`);
    console.log("--------------------------------------");
	bot.user.setGame(`Type -help for help! | Version 0.5.0 | in ${bot.guilds.size} servers!`);

	bot.guilds.forEach((g) => {
    if (!bot.settings.has(g.id)) {
      bot.settings.set(g.id, defaultSettings);
    }
  });

	handleMusic_Setup();
	});

bot.login(process.env.BOT_TOKEN);
//-------------------------->
// -> Functionality
function handleCommand(message, text)
{
	var handler = message.member;
	var args = text.slice(config.handles.prefix.length).trim().split(/ +/g);
	var cmd_raw = args.shift();
	var cmd = findCommand(cmd_raw);

	if(cmd)
	{
		if(cmd.admin && !handler.roles.has(config.handles.admin_role))
			message.reply(":no_entry_sign: Insufficient permissions!");
		else if(handleArgs(args, cmd.args))
			message.reply(":no_entry_sign: Insufficient parameters! Please refer to **" + config.handles.prefix + "commands** :arrow_left:");
		else
			cmd.exec(message, args);
	}
	else if(cmd_raw === "eval")
	{
		// > 'eval' command - handling seperately due to security risk
		if(message.author.id !== config.handles.owner_id) return;
		handleEval(message, args);
	}
}

function handleArgs(msg_args, cmd_args)
{
	//args.length < cmd.args.length
	var actual_args_count = 0;
	for(var i = 0; i < cmd_args.length; i++)
	{
		if(!cmd_args[i].includes("_"))
			actual_args_count++;
	}
	return (msg_args.length < actual_args_count);
}

function handleEval(message, args)
{
	const code = args.join(" ");
	if (!code) return message.channel.send("Put what args you want");
	const clean = text => {
		if (typeof(text) === "string")
			return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
		else
				return text;
	}
			try {
					 if(message.author.id !== config.handles.owner_id)  return message.channel.send("U think ill let u use my eval?	:no_good: well u were wrong, never judge a :blue_book: by its cover");
				const code = args.join(" ");
				let evaled = eval(code);
	
				if (typeof evaled !== "string")
					evaled = require("util").inspect(evaled);
					var embed2 = new _discord.RichEmbed()
					.setTitle("Evaled:", false)
					.setColor(0x59f75f)
					.addField("Evaled: :inbox_tray:",  `\`\`\`js\n${code}\n\`\`\``, false)
					.addField("Output: :outbox_tray:", `\`\`\`js\n${clean(evaled)}\n\`\`\``, false)
					.setFooter("Credits to ThatMajesticGuy#7530 for this Eval Command!")
					message.channel.send(embed2);
			} catch (err) {
				const code = args.join(" ");
				var embed3 = new _discord.RichEmbed()
				.setTitle("ERROR:")
				.setColor(0x920309)
				.addField("Evaled: :inbox_tray:", `\`\`\`js\n${code}\n\`\`\``, false)
				.addField("Output: :outbox_tray:", `\`ERROR\` \`\`\`xl\n${clean(err)}\n\`\`\``, false)
				.setFooter("Credits to ThatMajesticGuy#7530 for this Eval Command!")
				message.channel.send(embed3);
			}};

function cleanEval(text)
{
	if (typeof(text) === "string")
		return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
	else
		return text;
}

function findCommand(cmdName)
{
	// > Check commands
	for(var i = 0; i < commands.length; i++)
	{
		if(commands[i].command == cmdName.toLowerCase())
			return commands[i];
		else
		{
			// > Does the command have aliases?
			if(commands[i].command_aliases == 0 || !commands[i].command_aliases)
				continue;

			// > Check aliases
			for(var k = 0; k < commands[i].command_aliases.length; k++)
			{
				if(commands[i].command_aliases[k] == cmdName.toLowerCase())
					return commands[i];
			}
		}
	}
	return false;
}
//-------------------------->
// -> Music Functionality
function handleMusic_Play(connection, message)
{
	// > Grab our server queue
	var server = servers[message.guild.id];
	server.dispatcher = connection.playStream(_ytdl(server.queue[0], { filter: "audioonly" }));

	// > Set our song ID into our current playing song
	server.currentSong.yt_id = server.queue.shift(); // > Remove the playing song from the queue
	server.queueInfo.shift();
	_fetchvid(server.currentSong.yt_id, (err, videoInfo) =>
	{
		// > Check for errors
		if(err) throw new Error(err);

		// > Update our current song
		server.currentSong.title = videoInfo.title;
		server.currentSong.length = timeString(videoInfo.duration)
		server.currentSong.cur_stamp = timeString(server.dispatcher.time / 1000);
		server.currentSong.link = videoInfo.url;
		server.currentSong.thumbnail = videoInfo.thumbnailUrl;
		server.currentSong.published = videoInfo.datePublished;
		server.currentSong.familyfriendly = videoInfo.isFamilyFriendly;
		if(server.queueInfo[0].requester)
			server.currentSong.requester = server.queueInfo[0].requester;
	});

	server.dispatcher.on('end', () =>
	{
		if(server.queue[0])
			handleMusic_Play(connection, message);
		else
		{
			// > Clear the queue
			server.queue = [];
			server.queueInfo = [];
			server.skipReqs = 0;
			server.skippers = [];
			server.isPlaying = false;
			handleMusic_ResetCurrentSong(message.guild.id);
			connection.disconnect(); // leave the channel
		}
	});
}

function handleMusic_ResetCurrentSong(guildId)
{
	servers[guildId].currentSong = {
		yt_id: "",
		requester: "",

		title: "",
		length: 0,
		cur_stamp: 0,
		link: "",
		thumbnail: "",
		published: "",
		familyfriendly: null
	};
}

function handleMusic_Setup(guildId)
{
	servers[guildId] = {
		currentSong: { },
		queue: [],
		queueInfo: [],
		skipReqs: 0,
		skippers: [],
		isPlaying: false,
		isPaused: false,
		voiceChannel: null,
		dispatcher: null
	};
	handleMusic_ResetCurrentSong(guildId);
}

function handleMusic_GetID(str, callback)
{
	if(handleMusic_IsYouTubeURI(str))
		callback(_getytid(str));
	else
	{
		handleMusic_SearchYouTubeVideo(str, (id) =>
		{
			if(id == "null")
				return null;
			else
				callback(id);
		});
	}
}

function handleMusic_IsYouTubeURI(str)
{
	return str.toString().toLowerCase().indexOf("youtube.com") > -1;
}

function handleMusic_SearchYouTubeVideo(query, callback)
{
	_request("https://www.googleapis.com/youtube/v3/search?part=id&type=video&q=" + encodeURIComponent(query) + "&key=" + config.tokens.youtube_api, function(error, response, body)
	{
		var resp = JSON.parse(body);
        if(resp.items.length > 0)
    		callback(resp.items[0].id.videoId.toString());
        else
            callback("null");
	});
}

function handleMusic_SearchPlaylist(playlistId, message, pageToken = '')
{
    _request("https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=" + playlistId + "&key=" + config.tokens.youtube_api + "&pageToken=" + pageToken, (error, response, body) => {
        var json = JSON.parse(body);
        if ("error" in json) {
            console.log(json); return;
        } else if (json.items.length === 0) {
            console.log("json items length is 0 [empty]"); return;
        } else {
            console.log("handling playlist");
            for (var i = 0; i < json.items.length; i++) {
            var vid = json.items[i].snippet;
            // add to queue
                            handleMusic_AddToQueue(vid.resourceId.videoId, message.author.id, message.guild.id);
            // add to queueinfo
            
            var queueData = { title: null, length: null, link: null, requester: null };
            queueData.title = vid.title;
            queueData.length = 0;
            queueData.link = "http://youtu.be/" + vid.resourceId.videoId;
            queueData.requester = message.author.username;
            servers[message.guild.id].queueInfo.push(queueData);
                console.log("handling id: " + json.items[i].snippet.resourceId.videoId);
            }
            if(json.nextPageToken == null) {
                            console.log("QUEUE: ");
                            console.log(servers[message.guild.id].queue);
                            return;
                    }
            handleMusic_SearchPlaylist(playlistId, message, json.nextPageToken)
        }
    });
}

function handleMusic_AddToQueue(strId, authorId, guildId)
{
    var server = servers[guildId];

    if(handleMusic_IsYouTubeURI(strId))
        server.queue.push(_getytid(strId));
    else {
        server.queue.push(strId);
        console.log("added " + strId + " to guild: " + guildId);
    }
}

function timeString(seconds, forceHours = false)
{
	const hours = Math.floor(seconds / 3600);
	const minutes = Math.floor(seconds % 3600 / 60);
	return `${forceHours || hours >= 1 ? `${hours}:` : ""}${hours >= 1 ? `0${minutes}`.slice(-2) : minutes}:${`0${Math.floor(seconds % 60)}`.slice(-2)}`;
}

function getRandomInt(min, max)
{
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min)) + min;
}
client.login(process.env.BOT_TOKEN);
