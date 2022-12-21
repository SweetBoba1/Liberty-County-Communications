const { SlashCommandBuilder, Routes, PermissionFlagsBits } = require('discord.js');
const { REST } = require('@discordjs/rest');

const commands = [
    new SlashCommandBuilder().setName('ping').setDescription('Replies with bot statistics').setDMPermission(false),
    new SlashCommandBuilder().setName('developer').setDescription('Developer Options').addSubcommand(option => option.setName('resend_application_ticket').setDescription('Resends the application ticket maker to the channel this command was used in')).addSubcommand(option => option.setName('eval').setDescription('Evaluates a string of code').addStringOption(option => option.setName('string').setDescription('Line of code to evaluate').setMinLength(5).setRequired(true))),
    new SlashCommandBuilder().setName('application').setDescription('Application Options').setDMPermission(false).addSubcommand(option => option.setName('approve').setDescription('Approve an application').addUserOption(option => option.setName('user').setDescription('Please specity a user to accept').setRequired(true))).addSubcommand(option => option.setName('deny').setDescription('Denies an application').addUserOption(option => option.setName('user').setDescription('Please specify the user to deny').setRequired(true))),
]
    .map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken('MTA1NDE4MDQ1Mjc4Njc4MjIyOA.GTI78r.Z2Cm9WiZhSbIIsc5LZjK1QdE9IRnrxvAAw77-0');

rest.put(Routes.applicationCommands('1054180452786782228'), { body: commands })
    .then(() => console.log('Successfully registered application commands.'))
    .catch(console.error);
    