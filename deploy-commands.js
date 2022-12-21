const { SlashCommandBuilder, Routes, PermissionFlagsBits } = require('discord.js');
const { REST } = require('@discordjs/rest');
const config = require('./config.json');

// Main Code

const commands = [
    new SlashCommandBuilder().setName('ping').setDescription('Replies with bot statistics').setDMPermission(false),
    new SlashCommandBuilder().setName('developer').setDescription('Developer Options').addSubcommand(option => option.setName('resend_application_ticket').setDescription('Resends the application ticket maker to the channel this command was used in')).addSubcommand(option => option.setName('eval').setDescription('Evaluates a string of code').addStringOption(option => option.setName('string').setDescription('Line of code to evaluate').setMinLength(5).setRequired(true))),
    new SlashCommandBuilder().setName('application').setDescription('Application Options').setDMPermission(false).addSubcommand(option => option.setName('approve').setDescription('Approve an application').addUserOption(option => option.setName('user').setDescription('Please specity a user to accept').setRequired(true))).addSubcommand(option => option.setName('deny').setDescription('Denies an application').addUserOption(option => option.setName('user').setDescription('Please specify the user to deny').setRequired(true))),
]
    .map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(`${config.app_token}`);

rest.put(Routes.applicationCommands(`${config.app_id}`), { body: commands })
    .then(() => console.log('Successfully registered application commands.'))
    .catch(console.error);
