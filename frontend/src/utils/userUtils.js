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

export function getInitials(name) {
  return name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'VL';
}
