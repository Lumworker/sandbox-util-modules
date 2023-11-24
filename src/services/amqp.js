module.exports = async ({ Listener }, evtName) => {
  await Listener.assertQueue(evtName);
  await Listener.prefetch(1);

  Listener.consume(evtName, async (payload) => {
    if (!payload) {
      setTimeout(() => {
        Listener.ack(payload);
      }, 500);
      return;
    }

    const data = JSON.parse(payload.content.toString());
    console.log("🚀 ~ file: amqp.js ~ line 14 ~ Listener.consume ~ data", data);

    switch (data?.event) {
      default:
        setTimeout(() => {
          Listener.ack(payload);
        }, 500);
        break;
    }
  });
};
