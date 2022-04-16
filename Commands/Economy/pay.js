const Command = require("../../Structures/Command.js");
const profileModel = require("../../DBModels/profileSchema.js");

module.exports = new Command({
  name: "pay",
  description: "მოახდინეთ BTU Coin-ების გადარიცხვა",
  type: "SLASH",
  options: [
    {
      type: "USER",
      name: "user",
      description: "მომხმარებელი ვისთანაც გადარიცხვა გსურთ",
      required: true,
    },
    {
      type: "INTEGER",
      name: "amount",
      description: "თანხის ოდენობა მთელ რიცხვებში",
      required: true,
      minValue: 10,
    },
  ],

  async run(interaction, args) {
    let profileData = await profileModel.findOne({
      userID: interaction.user.id,
    });

    if (!profileData) {
      profileData = await profileModel.create({
        userID: interaction.user.id,
        BTUcoins: 500,
      });
      profileData.save();
    }
    if (interaction.options.getMember("user")?.roles.botRole)
      return interaction.followUp({
        content:
          "Bot-ები არ მოიხმარენ ჩვენ სერვისს <:FeelsBadMan:924601273028857866>",
      });
    const target = client.users.cache.get(
      interaction.options.getMember("user")?.id
    );
    if (!target)
      return interaction.followUp({
        content: "მომხმარებელი არ არსებობს!",
        ephemeral: true,
      });
    if (target.id === interaction.user.id)
      return interaction.followUp({
        content: "საკუთარ თავს ვერ გადაურიცხავთ!",
        ephemeral: true,
      });
    const amount = interaction.options.getInteger("amount");
    if (amount % 1 != 0 || amount <= 0)
      return interaction.followUp({
        content: "მიუთითეთ მთელი დადებით რიცხვი",
        ephemeral: true,
      });
    if (amount > profileData.BTUcoins)
      return interaction.followUp({
        content: `თქვენ არ გაქვთ ${amount} BTU Coin`,
        ephemeral: true,
      });
    const cutAmount = amount - amount * 0.02;

    try {
      let targetData = await profileModel.findOne({ userID: target.id });
      if (!targetData) {
        targetData = await profileModel.create({
          userID: target.id,
          BTUcoins: 500,
        });
        targetData.save();
      }

      await profileModel.findOneAndUpdate(
        {
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
          userID: target.id,
        },
        {
          $inc: {
            BTUcoins: +cutAmount,
          },
        }
      );

      return interaction.followUp({
        content: `ტრანზაქცია წარმატებით დასრულდა, თქვენ ჩამოგეჭრათ **${amount}** BTU Coin, და ${target.username}-ს ჩაერიცხა **${cutAmount}** BTU Coin`,
      });
    } catch (err) {
      console.log(err);
    }
  },
});
