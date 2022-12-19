const { NumberValidator } = require('@sapphire/shapeshift');
const { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ChannelType, PermissionsBitField, InteractionType, ActivityType, ModalBuilder, TextInputBuilder, TextInputStyle, AuditLogEvent, Collection, PermissionFlagsBits } = require('discord.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildBans, GatewayIntentBits.GuildWebhooks, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.DirectMessages, GatewayIntentBits.GuildEmojisAndStickers, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent], partials: ["CHANNEL"] });
const fs = require('fs');
const config = require('./configuration.json');

client.once('ready', () => {
    console.log('Application is now online!');

    client.user.setPresence({
        status: 'online'
    });
});

client.on('interactionCreate', async interaction => {
    const { commandName } = interaction;

    if (interaction.isChatInputCommand()) {
        if (commandName === 'ping') {
            const embed = new EmbedBuilder()
                .setColor('White')
                .setDescription(`Response time: ${Date.now() - interaction.createdTimestamp}ms\n API Response Time: ${Math.round(client.ws.ping)}ms`);

            await interaction.reply({ embeds: [embed], ephemeral: true });
        } else if (commandName === 'developer') {
            if (interaction.user.id !== '707632091168374866') {
                const embed = new EmbedBuilder()
                    .setColor('Red')
                    .setDescription('❌ You don\'t have permission to use this command');

                return interaction.reply({ embeds: [embed], ephemeral: true });
            }
            if (interaction.options.getSubcommand() === 'resend_application_ticket') {
                const embed = new EmbedBuilder()
                    .setColor('White')
                    .setAuthor({ name: 'Liberty County Communications', iconURL: client.user.displayAvatarURL() })
                    .setTitle('Create an Application')
                    .setDescription('Click the button below to create an application ticket!\nDisclaimer: *Creating a ticket and then leaving will result in moderation action!*');

                const row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('create_application')
                            .setLabel('Create Application')
                            .setStyle(ButtonStyle.Success)
                    );

                await interaction.channel.send({ embeds: [embed], components: [row] }).then(() => {
                    interaction.reply({ content: 'Successfully resent application embed', ephemeral: true });
                })
            }
        } else if (commandName === 'application') {
            if (interaction.options.getSubcommand() === 'approve') {
                if (interaction.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
                    const channel = interaction.channel.name.split('-')[1];

                    if (channel !== 'application') return interaction.reply({ content: 'You can only run this command in an application ticket', ephemeral: true });

                    const user = interaction.options.getUser('user');
                    const member = interaction.guild.members.cache.get(user.id);

                    if (member) {
                        const roles = ['761732299074699264', '884046986146361405', '761732663357734913', '884046967041323019', '795830521388204062'];
                        const embed = new EmbedBuilder()
                            .setColor('Green')
                            .setTitle('Welcome to Liberty County Communications')
                            .setDescription(`Congratulations! You have been accepted into Liberty County Communications and have received your roles in the LCC server. If you have any questions, please contact an application reader.`)
                            .setFooter({ text: 'Liberty County Communications', iconURL: client.user.displayAvatarURL() });

                        roles.forEach(role => {
                            member.roles.add(role);
                        });

                        await interaction.channel.send({ content: `<@${user.id}>`, embeds: [embed] });
                    }
                } else {
                    const embed = new EmbedBuilder()
                        .setColor('Red')
                        .setDescription('❌ You don\'t have permission to use this command');

                    await interaction.reply({ embeds: [embed], ephemeral: true });
                }
            } else if (interaction.options.getSubcommand() === 'deny') {
                if (interaction.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
                    const user = interaction.options.getUser('user');
                    const member = interaction.guild.members.cache.get(user.id);

                    if (member) {
                        const embed = new EmbedBuilder()
                            .setColor('Red')
                            .setTitle('Failed Application')
                            .setDescription(`Unfortunately, you have failed your application. You may reapply in 7 days after this message is sent.`)
                            .setFooter({ text: 'Liberty County Communications', iconURL: client.user.displayAvatarURL() });

                        await interaction.channel.send({ content: `<@${user.id}>`, embeds: [embed] });
                    }
                } else {
                    const embed = new EmbedBuilder()
                        .setColor('Red')
                        .setDescription('❌ You don\'t have permission to use this command');

                    await interaction.reply({ embeds: [embed], ephemeral: true });
                }
            }
        } else if (commandName === 'loa') {
            if (interaction.member.roles.cache.get('1054395477333913710')) {
                const length = interaction.options.getNumber('length');
                const reason = interaction.options.getString('reason');

                if (!Number(length)) return interaction.reply({ content: '`LENGTH` is not a valid number!', ephemeral: true });

                const embed = new EmbedBuilder()
                    .setColor('Red')
                    .setTitle('LOA Request')
                    .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                    .setDescription(`${interaction.user.tag} is requesting a leave of absence`)
                    .addFields([
                        {
                            name: 'Length',
                            value: `${length} days`,
                            inline: true
                        },
                        {
                            name: 'Reason',
                            value: `${reason}`,
                            inline: true
                        }
                    ])
                    .setTimestamp();

                const row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId(`approve_loa-${interaction.user.id}`)
                            .setLabel('Approve')
                            .setStyle(ButtonStyle.Success),
                        new ButtonBuilder()
                            .setCustomId(`deny_loa-${interaction.user.id}`)
                            .setLabel('Deny')
                            .setStyle(ButtonStyle.Danger)
                    )

                await interaction.guild.channels.cache.get('906310945775681597').send({ embeds: [embed], components: [row] }).then(() => {
                    interaction.reply({ embeds: [embed], ephemeral: true });
                })
            } else {
                const embed = new EmbedBuilder()
                    .setColor('Red')
                    .setDescription('❌ You need to be a dispatcher to be able to use this command!');

                await interaction.reply({ embeds: [embed], ephemeral: true });
            }
        }
    } else if (interaction.isButton()) {
        if (interaction.customId === 'create_application') {
            if (interaction.member.roles.cache.get('1054464191865565184')) return interaction.reply({ content: 'You already have a ticket open!', ephemeral: true });

            interaction.guild.channels.create({
                name: `${interaction.user.discriminator}-application`,
                parent: '761760921701842964',
                permissionOverwrites: [
                    {
                        id: interaction.user.id,
                        allow: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory],
                        deny: [PermissionFlagsBits.MentionEveryone]
                    }
                ]
            }).then(async (channel) => {
                const embed = new EmbedBuilder()
                    .setColor('White')
                    .setAuthor({ name: 'Liberty County Communications', iconURL: client.user.displayAvatarURL() })
                    .setTitle(`Application Ticket #${interaction.user.discriminator}`)
                    .setURL('https://forms.gle/Ldve7ycignePPNY69')
                    .setDescription(`Welcome to your application ticket ${interaction.user.tag}! You can find the application by clicking the blue title above. Please let us know when you have completed the application. Good luck!`);

                const row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId(`close_ticket-${interaction.user.id}`)
                            .setLabel('Close')
                            .setStyle(ButtonStyle.Danger)
                    );

                await channel.send({ content: `\`\`\`<@821529168457891842> <@${interaction.user.id}>\`\`\``, embeds: [embed], components: [row] }).then(async (message) => {
                    message.pin();

                    if (!interaction.member.roles.cache.get('1054191044356485170')) {
                        interaction.member.roles.add('1054191044356485170', 'Application Ticket Created');
                        await interaction.reply({ content: `Successfully created an application ticket. View your ticket here: <#${channel.id}>`, ephemeral: true });
                    }
                })
            })
        } else if (interaction.customId.startsWith('close_ticket')) {
            if (!interaction.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
                const embed = new EmbedBuilder()
                    .setColor('Red')
                    .setDescription('❌ You can\'t close this ticket!');

                await interaction.reply({ embeds: [embed], ephemeral: true });
            }
            const applicant = interaction.customId.split('-')[1];
            let collection = new Collection();
            let channel_messages = await interaction.channel.messages.fetch({ limit: 100 });
            collection = collection.concat(channel_messages);

            while (channel_messages.size === 100) {
                let lastMessageId = channel_messages.lastKey();
                channel_messages = await interaction.channel.messages.fetch({ limit: 100, before: lastMessageId });

                if (channel_messages) {
                    collection = collection.concat(channel_messages);
                }
            }

            let messages = collection.reverse();
            await interaction.reply({ content: 'Please wait...' }).then(async () => {
                await messages.forEach(message => {
                    fs.appendFile(`${interaction.channel.name}-log.txt`, `${message.author.username}: ${message.content}\n`, function (err) {
                        if (err) throw err;
                    })
                });

                await interaction.guild.channels.cache.get('851136052282130434').send({ files: [`./${interaction.channel.name}-log.txt`] }).then(() => {
                    fs.unlink(`${interaction.channel.name}-log.txt`, async function (err) {
                        if (err) throw err;
                        await interaction.editReply({ content: 'Successfully saved the ticket! Deleting this ticket in 5 seconds...' }).then(() => {
                            setTimeout(() => {
                                interaction.channel.delete();
                                let member = interaction.guild.members.cache.get(applicant);

                                if (member) {
                                    member.roles.remove('1054464191865565184', 'Application Ticket Closed')
                                }
                            }, 5000);
                        })
                    })
                })
            })
        }
    }
});

client.login(config.token);