export const STATUS_TICKET_LABELS = {
  NOVO: "Novo",
  ABERTO: "Aberto",
  EM_ATENDIMENTO: "Em atendimento",
  AGUARDANDO_TRIAGEM: "Aguardando triagem",
  AGUARDANDO_CLIENTE: "Aguardando cliente",
  RESOLVIDO: "Resolvido",
  CANCELADO: "Cancelado",
  ARQUIVADO: "Arquivado",
} as const;

export const PRIORIDADE_LABELS = {
  BAIXA: "Baixa",
  MEDIA: "Média",
  ALTA: "Alta",
  CRITICA: "Crítica",
} as const;

export const TIPO_CONTATO_LABELS = {
  SOLICITANTE: "Solicitante",
  BENEFICIARIO: "Beneficiário",
  DOADOR: "Doador",
  PARCEIRO: "Parceiro",
  VOLUNTARIO: "Dentista",
} as const;

export const CANAL_LABELS = {
  WHATSAPP: "WhatsApp",
  EMAIL: "E-mail",
  INSTAGRAM: "Instagram",
  TELEFONE: "Telefone",
  MANUAL: "Outro",
  WATSON_SANDBOX: "Watson Sandbox",
} as const;

export const CLASSIFICACAO_LABELS = {
  SAUDE: "Saúde",
  EMERGENCIA: "Saúde",
  AGENDAMENTO: "Agendamento",
  DOACAO: "Doação",
  PARCERIA: "Parceria",
  SOCIAL: "Social",
  VOLUNTARIADO: "Voluntariado",
  FEEDBACK: "Feedback",
  GERAL: "Geral",
} as const;

export const DENTISTA_STATUS_LABELS = {
  A: "Ativo",
  I: "Inativo",
  F: "Férias",
} as const;

export const PERFIL_LABELS = {
  ADMIN: "Administradora",
  COLABORADOR: "Colaborador",
} as const;

export const PERFIL_FRONT_ROLES = {
  ADMIN: "admin",
  COLABORADOR: "colaborador",
} as const;

export type StatusTicketCodigo = keyof typeof STATUS_TICKET_LABELS;
export type StatusTicketLabel = (typeof STATUS_TICKET_LABELS)[StatusTicketCodigo];
export type PrioridadeCodigo = keyof typeof PRIORIDADE_LABELS;
export type PrioridadeLabel = (typeof PRIORIDADE_LABELS)[PrioridadeCodigo];
export type TipoContatoCodigo = keyof typeof TIPO_CONTATO_LABELS;
export type TipoContatoLabel = (typeof TIPO_CONTATO_LABELS)[TipoContatoCodigo];
export type CanalCodigo = keyof typeof CANAL_LABELS;
export type CanalLabel = (typeof CANAL_LABELS)[CanalCodigo];
export type ClassificacaoCodigo = keyof typeof CLASSIFICACAO_LABELS;
export type ClassificacaoLabel = (typeof CLASSIFICACAO_LABELS)[ClassificacaoCodigo];
export type DentistaStatusCodigo = keyof typeof DENTISTA_STATUS_LABELS;
export type DentistaStatusLabel = (typeof DENTISTA_STATUS_LABELS)[DentistaStatusCodigo];
export type PerfilCodigo = keyof typeof PERFIL_LABELS;

export const EDITABLE_CONTACT_TYPE_LABELS = [
  TIPO_CONTATO_LABELS.SOLICITANTE,
  TIPO_CONTATO_LABELS.BENEFICIARIO,
  TIPO_CONTATO_LABELS.DOADOR,
  TIPO_CONTATO_LABELS.PARCEIRO,
] as const;

const STATUS_TICKET_ALIASES: Record<string, StatusTicketCodigo> = {
  AGUARDANDO: "AGUARDANDO_CLIENTE",
  FECHADO: "RESOLVIDO",
};

const CANAL_ALIASES: Record<string, CanalCodigo> = {
  OUTRO: "MANUAL",
  OUTROS: "MANUAL",
  CADASTRO_MANUAL: "MANUAL",
};

const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[-/]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase();

const keyLike = (value: string) => normalize(value).replace(/\s+/g, "_");

function labelPorCodigo<T extends Record<string, string>>(map: T, codigo?: string | null) {
  if (!codigo) return "";
  const key = codigo.trim().toUpperCase() as keyof T;
  return map[key] ?? codigo;
}

function codigoPorLabel<T extends Record<string, string>>(
  map: T,
  label?: string | null,
  aliases: Record<string, keyof T> = {},
) {
  if (!label) return undefined;
  const normalizedLabel = normalize(label);
  const alias = aliases[keyLike(label)];
  if (alias) return alias;

  return Object.entries(map).find(([, value]) => normalize(value) === normalizedLabel)?.[0] as keyof T | undefined;
}

export const statusTicketLabel = (codigo?: string | null) =>
  labelPorCodigo(STATUS_TICKET_LABELS, codigo);

export const statusTicketCodigo = (label?: string | null) =>
  codigoPorLabel(STATUS_TICKET_LABELS, label, STATUS_TICKET_ALIASES) as StatusTicketCodigo | undefined;

export const prioridadeLabel = (codigo?: string | null) =>
  labelPorCodigo(PRIORIDADE_LABELS, codigo);

export const prioridadeCodigo = (label?: string | null) =>
  codigoPorLabel(PRIORIDADE_LABELS, label) as PrioridadeCodigo | undefined;

export const tipoContatoLabel = (codigo?: string | null) =>
  labelPorCodigo(TIPO_CONTATO_LABELS, codigo);

// Dados antigos foram gravados como BENEFICIARIO antes da separacao entre
// solicitantes e beneficiarios. Mantemos BENEFICIARIO como opcao manual, mas
// exibimos esses registros legados da API como Solicitante nas telas.
export const tipoContatoRegistroLabel = (codigo?: string | null, nome?: string | null) => {
  const normalizedCode = codigo?.trim().toUpperCase();
  const normalizedName = nome ? normalize(nome) : "";
  const legacyBeneficiarioName = normalize(TIPO_CONTATO_LABELS.BENEFICIARIO);

  if (normalizedCode === "BENEFICIARIO" || (!normalizedCode && normalizedName === legacyBeneficiarioName)) {
    return TIPO_CONTATO_LABELS.SOLICITANTE;
  }
  if (normalizedCode === "VOLUNTARIO" || normalizedName === normalize("Dentista voluntário")) {
    return TIPO_CONTATO_LABELS.VOLUNTARIO;
  }

  return tipoContatoLabel(codigo) || nome || "";
};

export const tipoContatoCodigo = (label?: string | null) =>
  codigoPorLabel(TIPO_CONTATO_LABELS, label) as TipoContatoCodigo | undefined;

export const editableContactTypeLabel = (label?: string | null): string =>
  EDITABLE_CONTACT_TYPE_LABELS.find((type) => type === label) || TIPO_CONTATO_LABELS.SOLICITANTE;

export const canalLabel = (codigo?: string | null) =>
  labelPorCodigo(CANAL_LABELS, codigo);

export const canalCodigo = (label?: string | null) =>
  codigoPorLabel(CANAL_LABELS, label, CANAL_ALIASES) as CanalCodigo | undefined;

export const classificacaoLabel = (codigo?: string | null) =>
  labelPorCodigo(CLASSIFICACAO_LABELS, codigo);

export const classificacaoCodigo = (label?: string | null) =>
  codigoPorLabel(CLASSIFICACAO_LABELS, label) as ClassificacaoCodigo | undefined;

export const dentistaStatusLabel = (codigo?: string | null) =>
  labelPorCodigo(DENTISTA_STATUS_LABELS, codigo);

export const dentistaStatusCodigo = (label?: string | null) =>
  codigoPorLabel(DENTISTA_STATUS_LABELS, label) as DentistaStatusCodigo | undefined;

export const perfilLabel = (codigo?: string | null) =>
  labelPorCodigo(PERFIL_LABELS, codigo);

export const perfilFrontRole = (codigo?: string | null) => {
  if (!codigo) return undefined;
  return PERFIL_FRONT_ROLES[codigo.trim().toUpperCase() as PerfilCodigo];
};
