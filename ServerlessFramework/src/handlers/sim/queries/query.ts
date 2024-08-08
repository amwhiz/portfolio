export const query = {
  checkPlanExistence: `SELECT CASE WHEN count(*) > 0 THEN FALSE ELSE TRUE END AS canbuyanotherfreesim from  public.customers c inner join public.sims s ON c.id = s."customerId" inner join public."simPlans" sp ON sp."simId" = s.id where (c.email = ? OR c.whatsapp = ?) AND sp."productVariantId" = ?`,
  getBillingCardsData: `SELECT id, "createdAt", "updatedAt", "accountId", invoice, "paymentStatus", "paymentLink", "isExpired", amount, "isPaid", "paidAt", "weekStartDate", "weekEndDate", "dealId", "currentPlan", "totalSims", sims, Date("paymentDueDate") as "paymentDueDate" FROM public."billingTransactions" WHERE "accountId" = ? and "currentPlan" <> 'COD' ORDER BY "createdAt" DESC LIMIT 3`,
  getAgentPaymentHistory: `SELECT * FROM public."billingTransactions" WHERE "accountId" = ? AND ("createdAt" BETWEEN ? AND ?)`,
  getCodAgentPaymentHistory: `SELECT * from public."billingTransactions" WHERE "accountId" IN (?) AND "createdAt" between ? and ?`,
  getPartnerSimSales: `SELECT DATE_TRUNC('day', "createdAt") AS date, SUM("totalPrice") as "soldSimsAmount", COUNT(DISTINCT CASE WHEN type = 'Activation' THEN id END) AS "soldSimsCount" FROM public.orders where "accountId" = ? AND source = 'portal' AND "createdAt" BETWEEN ? AND ? GROUP BY DATE_TRUNC('day', "createdAt") ORDER BY date DESC`,
  getActiveSims: `SELECT sim.* FROM sims sim JOIN "simPlans" plans ON sim.id = plans."simId" WHERE sim."customerId" = ? AND (sim.status IN ('Active','Pre-Active')) AND plans."productId" = 3 AND plans."isActive"=true AND plans."expiryDate" >= CURRENT_DATE`,
};
