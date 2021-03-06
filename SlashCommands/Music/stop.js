const SlashCommand = require("../../Structures/SlashCommand.js");
const Discord = require("discord.js");

module.exports = new SlashCommand({
  name: "stop",
  description: "๐ต Stop Playing Music",

  async run(interaction, args, client) {
    const player = client.player;
    const queue = player.getQueue(interaction.guild);
    if (!queue)
      return interaction.reply({
        content: "แแแแแแแ แแฃแกแแแ แแ แแ แฉแแ แแฃแแ",
      });

    const collector = client.collectors.get(queue.guild.id);
    collector.stop();

    const Logo = new Discord.MessageAttachment("./Assets/BTULogo.png");
    const embed = new Discord.MessageEmbed();
    embed
      .setDescription("โ | `Finished Playing And Left The Channel`")
      .setColor("PURPLE")
      .setFooter({
        text: `BTU `,
        iconURL: "attachment://BTULogo.png",
      })
      .setTimestamp();
    interaction.channel.send({ embeds: [embed], files: [Logo] });
    return queue.destroy();
  },
});
