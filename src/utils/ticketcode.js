import crypto from "crypto";

export function generateTicketCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  const generateSegment = (length) => {
    let result = "";

    const bytes = crypto.randomBytes(length);

    for (let i = 0; i < length; i++) {
      result += chars[bytes[i] % chars.length];
    }

    return result;
  };

  const segment1 = generateSegment(4);
  const segment2 = generateSegment(4);

  return `TKT-${segment1}-${segment2}`;
}