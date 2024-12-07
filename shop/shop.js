const Jimp = require("jimp");
require("dotenv/config");
const discordWebhook = require("./Assets/discord_webhook.js");

const { shopItem: shopItemImage, finishProgram } = require("./Assets/utils.js");

async function dailyScript() {
    const { default: fetch } = await import('node-fetch');

    console.log("[INFO] Checking store items");
    
    const shopData = await fetch(
        "https://fortnite-api.com/v2/shop?language=en")


    .then(async (res) => {
        if (res.ok) return await res.json();
        await finishProgram(
            `[ERROR] The Status Code received is as expected: ${res.status}`
        );
    })
    .then((jsonRes) => jsonRes.data)
    .catch((err) => {
        console.log(err);
    });

    const currentDate = shopData.date.replace("T", "-").split(`-`);
    const shopItems = shopData.entries.filter(item => item.offerTag?.id != "sparksjamloop");

    console.log(`[INFO] Verified store, ${shopItems.length} items found`);

    console.log("[INFO] Generating image of items\n");

    const missingItemImage = await Jimp.read("./shop/Assets/images/QuestionMark.png");
    const largeItemOverlay = await Jimp.read("./shop/Assets/images/LargeOverlay.png");
    const smallItemOverlay = await Jimp.read("./shop/Assets/images/SmallOverlay.png");
    const shopBackground = await Jimp.read("./shop/Assets/images/Background.png");
    const vbucksIcon = await Jimp.read("./shop/Assets/images/VBucks.png");

    const titleFont = await Jimp.loadFont("./shop/Assets/fonts/burbark/burbark_200.fnt");
    const dateFont = await Jimp.loadFont("./shop/Assets/fonts/burbark/burbark_64.fnt");
    const burbankFont20 = await Jimp.loadFont("./shop/Assets/fonts/burbark/burbark_20.fnt");
    const burbankFont16 = await Jimp.loadFont("./shop/Assets/fonts/burbark/burbark_16.fnt");

    const itemPromises = [];

    shopItems.forEach((shopItem) => {
        itemPromises.push(
            new Promise(async (resolve) => {
                const itemCount = shopItem.brItems?.length || shopItem.tracks?.length || shopItem.instruments?.length || shopItem.cars?.length || shopItem.legoKits?.length;
                const firstItem = shopItem.brItems?.[0] || shopItem.tracks?.[0] || shopItem.instruments?.[0] || shopItem.cars?.[0] || shopItem.legoKits?.[0];
                const itemRarity =
                    firstItem.rarity?.backendValue.split("EFortRarity::")[1];
                const itemSeries = firstItem.series?.backendValue;
                let itemBackground;
                let itemImage;

                try {
                    if (itemSeries)
                        itemBackground = await Jimp.read(
                        `./shop/Assets/images/series/${itemSeries}.png`
                    );
                    else
                    itemBackground = await Jimp.read(
                        `./shop/Assets/images/rarities/${itemRarity}.png`
                    );
                } catch {
                    itemBackground = await Jimp.read(`./shop/Assets/images/rarities/Common.png`);
                }

                try {
                    if (shopItem.bundle?.image)
                        itemImage = await Jimp.read(shopItem.bundle.image);
                    else if (firstItem.type.backendValue == "AthenaItemWrap")
                        itemImage = await Jimp.read(
                        shopItem.newDisplayAsset?.renderImages?.[0].image ||
                        firstItem.images.icon ||
                        firstItem.images.featured ||
                        firstItem.images.smallIcon ||
                        firstItem.images.large
                    );
                    else
                    itemImage = await Jimp.read(
                        shopItem.newDisplayAsset?.renderImages?.[0].image ||
                        firstItem.images.featured ||
                        firstItem.images.icon ||
                        firstItem.images.smallIcon ||
                        firstItem.images.large
                    );
                } catch {
                    itemImage = missingItemImage;
                }

                itemBackground.resize(256, 256).blit(itemImage.resize(256, 256), 0, 0);

                const itemText = (
                    shopItem.bundle?.name || firstItem.name || firstItem.title
                )?.toUpperCase() || "?????";
                const textHeight = Jimp.measureTextHeight(burbankFont20, itemText, 245);
                const PriceWidth =
                26 + 5 + Jimp.measureText(burbankFont20, `${shopItem.finalPrice}`);

                let priceTextPos;

                if (textHeight <= 22) {
                    itemBackground.blit(smallItemOverlay, 0, 0);
                    priceTextPos = 198;
                } else {
                    itemBackground.blit(largeItemOverlay, 0, 0);
                    priceTextPos = 178;
                }

                if (shopItem.bundle || itemCount >= 2) {
                    const subItemsText = `${shopItem.bundle
                        ? itemCount
                        : "+" + (itemCount - 1)
                    }`;
                    const subItemsTextWidth = Jimp.measureText(burbankFont16, subItemsText);
                    const subItemTag = new Jimp(subItemsTextWidth + 4, 20, 0x0);
                    subItemTag.print(burbankFont16, 2, 4, subItemsText);
                    itemBackground.blit(subItemTag, 243 - subItemsTextWidth, 226);
                }

                let priceTag = new Jimp(PriceWidth, 26, 0x0);
                priceTag.blit(vbucksIcon.resize(26, 26), 1, 0);

                itemBackground.print(
                    burbankFont20,
                    8,
                    priceTextPos,
                    {
                        text: itemText,
                        alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
                    },
                    240
                );

                priceTag.print(burbankFont20, 31, 5, {
                    text: shopItem.finalPrice.toString(),
                });

                itemBackground.blit(priceTag, 128 - PriceWidth / 2, 220);

                console.log(`Ready item: "${itemText}"`);
                resolve(
                    new shopItemImage(
                        itemText,
                        shopItem.layoutId,
                        firstItem.offerTag?.id,
                        itemSeries,
                        itemRarity,
                        itemBackground
                    )
                );
            })
        );
    });

    const collumsCount = shopItems.length > 48 ? (shopItems.length > 90 ? 16 : 12) : 8;

    shopBackground.resize(
        256 * collumsCount + 15 * (collumsCount - 1) + 100,
        256 * Math.ceil(shopItems.length / collumsCount) +
        15 * (Math.ceil(shopItems.length / collumsCount) - 1) +
        350
    );

    const titleText = "ITEM SHOP";
    const leftWatermark = "BY : IKOKO";
    const rightWatermark = "FortiBot";
    const dateText = `DAY ${currentDate[2]}/${currentDate[1]}/${currentDate[0]}`;

    const titleWidth = Jimp.measureText(titleFont, titleText);
    const dateWidth = Jimp.measureText(dateFont, dateText);
    const watermarkWidth = Jimp.measureText(burbankFont20, rightWatermark);

    shopBackground.print(
        titleFont,
        shopBackground.bitmap.width / 2 - titleWidth / 2,
        35,
        titleText
    );
    shopBackground.print(
        dateFont,
        shopBackground.bitmap.width / 2 - dateWidth / 2,
        215,
        dateText
    );

    shopBackground.print(
        burbankFont20,
        10,
        shopBackground.bitmap.height - 30,
        leftWatermark
    );
    shopBackground.print(
        burbankFont20,
        shopBackground.bitmap.width - watermarkWidth - 10,
        shopBackground.bitmap.height - 30,
        rightWatermark
    );

    let currentShopRow = 0;
    let currentShopColumn = 0;
    let lastLineOffset = 0;

    const itemImages = await Promise.all(itemPromises);

    itemImages.sort((a, b) => {
        const namePoints =
        a.itemName > b.itemName ? 1 : a.itemName < b.itemName ? -1 : 0;
        return b.sortPoints - a.sortPoints + namePoints;
    });

    console.log("\n[INFO] Generating store image");

    itemImages.forEach(({ image }) => {

        if (
            lastLineOffset === 0 &&
            currentShopRow === Math.floor(itemImages.length / collumsCount)
        )
        lastLineOffset =
        (256 * (collumsCount - (itemImages.length % collumsCount)) +
        (collumsCount - (itemImages.length % collumsCount)) * 15) / 2;

        shopBackground.blit(
            image,
            lastLineOffset + 256 * currentShopColumn + 15 * currentShopColumn + 50,
            256 * currentShopRow + 15 * currentShopRow + 300
        );

        if ((currentShopColumn + 1) % collumsCount === 0) {
            currentShopRow += 1;
            currentShopColumn = 0;
        } else currentShopColumn += 1;
    });

    const savePath = './shop/Temp/';
    const fixedFileName = 'shopImage.png';

    async function saveImage() {
        return new Promise(async (resolve, reject) => {
            try {
                const fileName = fixedFileName;
                await shopBackground.writeAsync(savePath + fileName);
                resolve(fileName);
            } catch (err) {
                reject(err);
            }
        });
    }

    saveImage().then((savedFile) => {
        console.log("[INFO] Image of the store created");
        if (process.env.UPLOAD_TO_DISCORD_WEBHOOK.toLocaleLowerCase() === 'yes') 
            discordWebhook(savePath, savedFile);
    }).catch((err) => {
        console.error("[ERROR] Error saving store image:", err);
    });
};

module.exports = dailyScript;
