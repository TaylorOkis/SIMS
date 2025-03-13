import db from "../../database/db.js";
import cron from "node-cron";
import { sendDeduplicatedAlert } from "../sse.js";

cron.schedule("0 * * * *", async () => {
  try {
    const lowStockProducts = await db.$queryRaw`
    SELECT id, name, sku, "stockQty"
    FROM "Product"
    WHERE "stockQty" <= "alertQty"
  `;

    lowStockProducts.forEach((product) =>
      sendDeduplicatedAlert(
        product.id,
        `Scheduled check: ${product.name} (${product.sku}) has ${product.quantity} units left`
      )
    );
  } catch (error) {
    throw new Error("An error occurred while trying to delete expired tokens");
  }
});
