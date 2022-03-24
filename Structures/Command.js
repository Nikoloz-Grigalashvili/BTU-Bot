const Client = require("./Client.js");
const Discord = require("discord.js");

/**
 * @param {Discord.Message | Discord.Interaction} message
 * @param {string[]} args
 * @param {Client} client
 */
function RunFunction(message, args, client) {}

class Command {
  /**
   * @typedef {{name: string, description: string, showHelp: Boolean, aliases: string, permissions: Discord.PermissionString, type: String, options: Discord.ApplicationCommandOption[], run: RunFunction }} CommandOptions
   * @param {CommandOptions} Options
   */
  constructor(Options) {
    this.name = Options.name;
    this.showHelp = Options.showHelp;
    this.description = Options.description;
    this.permissions = Options.permissions;
    this.aliases = Options.aliases;
    this.type = ["BOTH", "SLASH", "TEXT"].includes(Options.type)
      ? Options.type
      : "TEXT";
    this.options = Options.options || [];
    this.run = Options.run;
  }
}

module.exports = Command;