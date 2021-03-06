const SlashCommand = require("../../Structures/SlashCommand.js");
const { QueueRepeatMode } = require("discord-player");
const Discord = require("discord.js");

module.exports = new SlashCommand({
  name: "skip",
  description: "🎵 Skip A  Song",
  options: [
    {
      name: "amount",
      description: "Amount To Be Skipped",
      type: "INTEGER",
      required: false,
      minValue: 1,
    },
  ],

  async run(interaction, args, client) {
    const player = client.player;
    const queue = player.getQueue(interaction.guild);
    if (!queue?.playing)
      return interaction.reply({
        content: "Music Is Not Being Played",
      });

    if (
      interaction.user.id !== queue.current.requestedBy.id &&
      !interaction.member.roles.cache.some((r) => r.name === "DJ")
    ) {
      return interaction.reply({
        content:
          "Current Song Must Be Requested By You Or You Must Have DJ Role To Use This Command",
        ephemeral: true,
      });
    }

    let amount = args[0] || 1;

    const loopMode =
      queue.repeatMode === QueueRepeatMode.TRACK
        ? "Song"
        : queue.repeatMode === QueueRepeatMode.QUEUE
        ? "Queue"
        : queue.repeatMode === QueueRepeatMode.AUTOPLAY
        ? "Autoplay"
        : "OFF";

    const Logo = new Discord.MessageAttachment("./Assets/BTULogo.png");
    const embed = new Discord.MessageEmbed();
    embed
      .setTitle("Current Song Skipped")
      .setAuthor({
        name: queue.current.requestedBy.username,
        iconURL: queue.current.requestedBy.displayAvatarURL({ dynamic: true }),
      })
      .addFields(
        {
          name: "Loop Mode",
          value: `\`\`\` ${loopMode} \`\`\``,
          inline: true,
        },
        {
          name: "Volume",
          value: `\`\`\` ${queue.volume} \`\`\``,
          inline: true,
        }
      )
      .setColor("PURPLE")
      .setFooter({
        text: `BTU `,
        iconURL: "attachment://BTULogo.png",
      })
      .setTimestamp();

    if (amount > 1) {
      if (amount > queue.tracks.length) amount = queue.tracks.length - 1;
      if (amount <= 0) {
        embed.setTitle(`Skipped \`1\` Songs`);
        queue.skip();
        return interaction.reply({ embeds: [embed], files: [Logo] });
      }
      const skippedTracks = queue.tracks.slice(0, amount);
      queue.skipTo(amount);
      setTimeout(() => {
        for (i = 0; i < amount; i++) {
          queue.previousTracks.splice(-1, 0, skippedTracks[i]);
        }
      }, 300);
      embed.setTitle(`Skipped \`${amount}\` Songs`);
      return interaction.reply({ embeds: [embed], files: [Logo] });
    } else {
      queue.skip();
      return interaction.reply({ embeds: [embed], files: [Logo] });
    }
  },
});
