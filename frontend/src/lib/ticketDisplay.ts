import type { Ticket } from "@/contexts/TicketsContext";

export const ticketDateStamp = (ticket: Ticket) => {
  const protocolDate = (ticket.protocol || ticket.id).match(/TKT-(\d{8})/)?.[1];
  if (protocolDate) return protocolDate;

  const openedDate = ticket.openedAt.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  if (openedDate) {
    const [, day, month, year] = openedDate;
    return `${year}${month}${day}`;
  }

  const today = new Date();
  return [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("");
};

export const ticketSequence = (ticket: Ticket) => {
  const rawProtocol = ticket.protocol || ticket.id;
  const standardSequence = rawProtocol.match(/^TKT-\d{8}-(\d+)$/)?.[1];
  if (standardSequence) return standardSequence.padStart(3, "0");

  const generatedSequence = rawProtocol.match(/^TKT-\d{8}-\d{4}-(\d+)$/)?.[1];
  if (generatedSequence) return generatedSequence.padStart(3, "0");

  const simpleSequence = rawProtocol.match(/^TKT-(\d+)$/)?.[1];
  if (simpleSequence) return simpleSequence.padStart(3, "0");

  const numericId = ticket.id.match(/\d+$/)?.[0];
  return (numericId || "0").padStart(3, "0");
};

export const ticketDisplayProtocol = (ticket: Ticket) =>
  `TKT-${ticketDateStamp(ticket)}-${ticketSequence(ticket)}`;
