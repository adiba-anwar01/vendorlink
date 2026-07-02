export function getVendorId(vendor) {
  return (
    vendor?._id ??
    vendor?.id ??
    vendor?.vendor?._id ??
    vendor?.vendor?.id ??
    vendor?.user?._id ??
    vendor?.user?.id
  )?.toString() ?? '';
}

export function getConversationSellerId(conversation) {
  return (
    conversation?.seller?._id ??
    conversation?.seller?.id ??
    conversation?.seller?.vendor?._id ??
    conversation?.seller?.user?._id ??
    conversation?.product?.seller?._id ??
    conversation?.product?.seller?.id ??
    conversation?.product?.vendor?._id ??
    conversation?.product?.vendor?.id ??
    conversation?.seller
  )?.toString() ?? '';
}

export function isVendorUser(conversation, vendor) {
  const currentUserId = getVendorId(vendor);
  const sellerId = getConversationSellerId(conversation);
  return Boolean(currentUserId && sellerId && currentUserId === sellerId);
}

export function getChatPartner(conversation, vendor) {
  const isVendor = isVendorUser(conversation, vendor);
  return isVendor ? conversation?.buyer : conversation?.seller;
}

export function getDisplayName(entity, fallback = 'User') {
  if (typeof entity === 'string' && entity.trim()) return entity;
  return entity?.name ?? entity?.email ?? fallback;
}