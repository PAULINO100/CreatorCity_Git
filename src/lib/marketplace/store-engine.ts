import prisma from "@/lib/db/prisma";

export async function listItems(category?: string) {
  return prisma.marketplaceItem.findMany({
    where: category ? { category } : undefined,
    orderBy: { price_cc: 'asc' }
  });
}

export async function getUserInventory(userId: string) {
  return prisma.userPurchase.findMany({
    where: { user_id: userId },
    include: { item: true }
  });
}

export async function purchaseItem(userId: string, itemId: string) {
  // Prisma transaction to prevent race conditions
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({
      where: { id: userId },
      include: { city_credit: true, building: true }
    });
    
    if (!user || !user.city_credit) throw new Error("User or wallet not found");

    const item = await tx.marketplaceItem.findUnique({
      where: { id: itemId }
    });
    
    if (!item) throw new Error("Item not found");

    const existing = await tx.userPurchase.findUnique({
      where: {
        user_id_item_id: {
          user_id: userId,
          item_id: itemId
        }
      }
    });
    if (existing) throw new Error("Item already owned");

    // Calculate district discount: 10% off if the user has claimed a district
    const discount = user.district_claimed ? 0.10 : 0;
    const finalPrice = Math.floor(item.price_cc * (1 - discount));

    if (user.city_credit.balance < finalPrice) {
      throw new Error(`Insufficient CC. Needed: ${finalPrice}, Balance: ${user.city_credit.balance}`);
    }

    await tx.cityCredit.update({
      where: { user_id: userId },
      data: { balance: { decrement: finalPrice } }
    });

    const purchase = await tx.userPurchase.create({
      data: {
        user_id: userId,
        item_id: itemId,
        equipped: false
      }
    });

    return { success: true, item, finalPrice, purchase, newBalance: user.city_credit.balance - finalPrice };
  });
}

export async function equipItem(userId: string, itemId: string) {
  return prisma.$transaction(async (tx) => {
    const purchase = await tx.userPurchase.findUnique({
      where: { user_id_item_id: { user_id: userId, item_id: itemId } },
      include: { item: true }
    });
    
    if (!purchase) throw new Error("You don't own this item");

    // Unequip all items of the same category if we are equipping
    if (!purchase.equipped) {
      const allPurchases = await tx.userPurchase.findMany({
        where: { user_id: userId },
        include: { item: true }
      });
      
      for (const p of allPurchases) {
        if (p.item.category === purchase.item.category && p.equipped) {
          await tx.userPurchase.update({
            where: { id: p.id },
            data: { equipped: false }
          });
        }
      }
    }

    // Toggle
    return tx.userPurchase.update({
      where: { id: purchase.id },
      data: { equipped: !purchase.equipped },
      include: { item: true }
    });
  });
}
