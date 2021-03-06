const SlashCommand = require("../../Structures/SlashCommand.js");
const profileModel = require("../../DBModels/profileSchema.js");
const { FeelsBadMan } = require("../../Data/emojis.json");

module.exports = new SlashCommand({
  name: "pay",
  description: "๐ณ แแแแฎแแแแแ BTU Coin-แแแแก แแแแแ แแชแฎแแ",
  options: [
    {
      type: "USER",
      name: "user",
      description: "แแแแฎแแแ แแแแแ แแแกแแแแแช แแแแแ แแชแฎแแ แแกแฃแ แ",
      required: true,
    },
    {
      type: "INTEGER",
      name: "amount",
      description: "แแแแฎแแก แแแแแแแ แแแแ แ แแชแฎแแแแจแ",
      required: true,
      minValue: 10,
    },
  ],

  async run(interaction, args, client) {
    const profileData = await profileModel.findOne({
      guildId: interaction.guildId,
      userID: interaction.user.id,
    });

    if (interaction.options.getMember("user")?.roles.botRole)
      return interaction.reply({
        content: `Bots Don't Use Our Services ${FeelsBadMan.emoji}`,
      });
    const target = client.users.cache.get(
      interaction.options.getMember("user")?.id
    );
    if (!target)
      return interaction.reply({
        content: "User Doesn't Exist!",
        ephemeral: true,
      });
    if (target.id === interaction.user.id)
      return interaction.reply({
        content: "Can't Pay Yourself!",
        ephemeral: true,
      });
    const amount = interaction.options.getInteger("amount");
    if (amount > profileData.BTUcoins)
      return interaction.reply({
        content: `Insufficent Funds!\nYour Balance: ${profileData.BTUcoinss}`,
        ephemeral: true,
      });
    const cutAmount = amount - amount * 0.02;

    await profileModel.findOneAndUpdate(
      {
        guildId: interaction.guild.id,
        userID: interaction.user.id,
      },
      {
        $inc: {
          BTUcoins: -amount,
        },
      }
    );

    await profileModel.findOneAndUpdate(
      {
        guildId: interaction.guild.id,
        userID: target.id,
      },
      {
        $inc: {
          BTUcoins: +cutAmount,
        },
      },
      { upsert: true }
    );

    return interaction.reply({
      content: `Transaction Ended Successfully, **${amount}** BTU Coins Were Taken From Your Account\n${target.username} Received **${cutAmount}** BTU Coins`,
    });
  },
});
