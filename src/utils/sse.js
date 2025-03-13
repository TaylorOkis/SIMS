const clients = new Set();
const sendNotificationToClients = (data) => {
  clients.forEach((client) =>
    client.res.write(`data: ${JSON.stringify(data)}\n\n`)
  );
};

const sentAlerts = new Set();
const sendDeduplicatedAlert = (productId, message) => {
  if (!sentAlerts.has(productId)) {
    sendNotificationToClients({ type: "LOW-STOCK", message });
    sentAlerts.add(productId);
  }
  setTimeout(() => sentAlerts.delete(productId), 24 * 60 * 60 * 1000);
};

export { clients, sendDeduplicatedAlert };
