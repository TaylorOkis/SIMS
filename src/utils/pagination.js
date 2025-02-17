const paginate = (page, limit) => {
  return (page - 1) * limit;
};

export default paginate;
