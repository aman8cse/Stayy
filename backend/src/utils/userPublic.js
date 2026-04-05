export function toPublicUser(doc) {
  return {
    id: doc._id.toString(),
    name: doc.name,
    email: doc.email,
    phone: doc.phone,
    role: doc.role,
    isVerified: doc.isVerified,
  };
}
