export const pagingSkipValue = (page, itemsPerPage) => {
  // Luôn đảm bảo nếu không truyền đủ tham số thì trả về 0
  if (!page || !itemsPerPage) return 0

  // Tránh trường hợp client truyền số trang <= 0 làm công thức ra số âm gây lỗi $skip ở MongoDB
  if (page <= 0 || itemsPerPage <= 0) return 0

  return (page - 1) * itemsPerPage
}