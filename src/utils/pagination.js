const paginate = (page = 1, limit = 15) => {
  return (page - 1) * limit;
};

export default paginate;
