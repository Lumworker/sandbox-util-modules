module.exports = {
  handleError: (res, message) => {
    res
      .status(400)
      .json({
        error: true,
        errorMessage: message,
        timestamp: new Date().getTime(),
      })
      .end();
  },
  handleSuccess: (res, { payload }) => {
    return res
      .status(200)
      .json({
        ...payload,
        timestamp: new Date().getTime(),
      })
      .end();
  },
};
