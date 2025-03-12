-- AlterTable
ALTER TABLE "User" ADD COLUMN     "resetToken" TEXT,
ADD COLUMN     "resetTokenExpiry" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Item_quantity_productId_idx" ON "Item"("quantity", "productId");

-- CreateIndex
CREATE INDEX "Order_salesPersonId_status_idx" ON "Order"("salesPersonId", "status");

-- CreateIndex
CREATE INDEX "Product_name_stockQty_sellingPrice_idx" ON "Product"("name", "stockQty", "sellingPrice");

-- CreateIndex
CREATE INDEX "Sale_salesPersonId_status_idx" ON "Sale"("salesPersonId", "status");

-- CreateIndex
CREATE INDEX "User_username_email_phone_role_idx" ON "User"("username", "email", "phone", "role");
