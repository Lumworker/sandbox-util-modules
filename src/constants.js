module.exports = {
  appPort: process.env.PORT || 3000,
  // nginxContext: process.env.NGINX_ROOT_PATH || "/utility",
  amqpConnect: process.env.AMQP_CONNECT,
  amqpPrefetch: Number(process.env.AMWP_PREFETCH) || 1,
  amqpNodeQSocket: process.env.AMQP_NODE_QSOCKET || "TMLTH_EVT_LOCAL_5101",
  amqpNodeAPI: process.env.AMQP_NODE_API || "TMLTH_EVT_LOCAL_5100",
};
