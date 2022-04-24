const Command = require("../../Structures/Command.js");
const profileModel = require("../../DBModels/profileSchema.js");
const itemModel = require("../../DBModels/itemSchema.js");
const Discord = require("discord.js");

module.exports = new Command({
  name: "shop",
  description: "Shop Commands",
  type: "SLASH",
  options: [
    {
      name: "see",
      description: "See The Shop",
      type: "SUB_COMMAND",
    },
    {
      name: "buy",
      description: "Buy An Item From The Shop",
      type: "SUB_COMMAND",
      options: [
        {
          name: "item",
          description: "Index Of The Item You Wish To Purchase",
          type: "INTEGER",
          required: true,
        },
      ],
    },
  ],

  async run(interaction, args, client) {
    if (interaction.options.getSubcommand() === "see") {
      const Logo = new Discord.MessageAttachment("./Pictures/BTULogo.png");
      const shopEmbed = new Discord.MessageEmbed();
      shopEmbed
        .setTitle("⠀⠀▬▬▬▬▬▬▬▬▬ BTU Shop ▬▬▬▬▬▬▬▬▬⠀⠀")
        .setDescription(
          "```ყველა ნივთი რომლის ყიდვაც BTU Coin-ებით შეგიძლიათ```"
        )
        .addFields(
          {
            name: "⠀⠀ 👑 ▬▬▬▬▬▬▬▬ Legendary Tier ▬▬▬▬▬▬▬▬ 👑⠀⠀",
            value: "```🟠 1. ბეთეუს N1 ლობიანი  |  2000 Coins\n```",
          },
          {
            name: "⠀⠀⠀⠀⠀⠀ ▬▬▬▬▬▬▬▬ Epic Tier ▬▬▬▬▬▬▬▬ ⠀⠀⠀⠀",
            value: "```🔴 2. ბეთეუს 2 ბირთვიანი AIO  |  1000 Coins\n```",
          },
          {
            name: "⠀⠀⠀⠀⠀⠀ ▬▬▬▬▬▬▬▬ Rare Tier ▬▬▬▬▬▬▬▬ ⠀⠀⠀⠀",
            value: "```🔵 3. ბეთეუს Parking Spot  | 500 Coins\n```",
          }
        )
        .setColor("PURPLE")
        .setFooter({
          text: "Use Command /shop buy To Purchase An Item",
          iconURL: "attachment://BTULogo.png",
        })
        .setTimestamp();

      return interaction.followUp({ embeds: [shopEmbed], files: [Logo] });
    } else {
      //buy sub command starts here

      const itemIndex = interaction.options.getInteger("item") - 1;

      const itemList = [
        { name: "🟠 ბეთეუს N1 ლობიანი", price: 2000, tier: 1 },
        { name: "🔴 ბეთეუს 2 ბირთვიანი AIO", price: 1000, tier: 2 },
        { name: "🔵 ბეთეუს Parking Spot", price: 500, tier: 3 },
      ];

      let profileData =
        (await profileModel.findOne({ userID: interaction.user.id })) || null;

      if (profileData === null) {
        profileData = await profileModel.create({
          userID: interaction.user.id,
          BTUcoins: 500,
        });
        profileData.save();
      }

      const moneyBefore = profileData.BTUcoins;

      if (profileData.BTUcoins < itemList[itemIndex].price) {
        return interaction.followUp({
          content: "თანხა არ გყოფნით",
        });
      } else {
        let itemData =
          (await itemModel.findOne({
            userID: interaction.user.id,
            itemName: itemList[itemIndex].name,
          })) || null;

        await profileModel.findOneAndUpdate(
          {
            userID: interaction.user.id,
          },
          {
            $inc: {
              BTUcoins: -itemList[itemIndex].price,
            },
          }
        );

        if (itemData !== null) {
          await itemModel.findOneAndUpdate(
            {
              userID: interaction.user.id,
              itemName: itemList[itemIndex].name,
            },
            {
              $inc: {
                itemAmount: +1,
              },
            }
          );
        } else {
          itemData = await itemModel.create({
            userID: interaction.user.id,
            itemName: itemList[itemIndex].name,
            itemAmount: 1,
            itemTier: itemList[itemIndex].tier,
          });
          itemData.save();
        }

        const embed = new Discord.MessageEmbed();
        embed
          .setTitle("Success")
          .setDescription(
            `წარმატებით შეიძინეთ \`${itemList[itemIndex].name}\`
            \nძველი ბალანსი: \`${moneyBefore}\`, ახალი: \`${
              moneyBefore - itemList[itemIndex].price
            }\``
          )
          .setAuthor({
            name: interaction.user.username,
            iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
          })
          .setColor("PURPLE")
          .setFooter({
            text: "BTU ",
            iconURL: "attachment://BTULogo.png",
          })
          .setTimestamp();
        interaction.followUp({ embeds: [embed], files: [Logo] });
      }
    }
  },
});
